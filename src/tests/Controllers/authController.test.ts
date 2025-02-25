import { Request, Response } from 'express';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { login, signup, logout } from '../../controllers/authController'; // Adjust path as needed

const originalPrisma = jest.requireActual('@prisma/client');
const originalBcrypt = jest.requireActual('bcryptjs');
const originalJwt = jest.requireActual('jsonwebtoken');

jest.mock('../../config', () => ({
  JWT_SECRET: 'test-secret'
}));

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn()
    },
    $disconnect: jest.fn()
  };
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
  };
});

jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('Authentication Controller Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockPrismaClient: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
    
    mockPrismaClient = (PrismaClient as jest.Mock).mock.results[0]?.value;
    
    if (!mockPrismaClient) {
      new PrismaClient();
      mockPrismaClient = (PrismaClient as jest.Mock).mock.results[0].value;
    }
  });
  
  describe('login', () => {
    it('should return 401 if user not found', async () => {

      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      
      await login(mockReq as Request, mockRes as Response);
      
      expect(mockPrismaClient.user.findFirst).toHaveBeenCalledWith({ 
        where: { email: 'test@example.com' } 
      });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid User' });
    });
    
    it('should return 401 if password is incorrect', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockPrismaClient.user.findFirst.mockResolvedValue({ 
        id: '1', 
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user'
      });
      (bcryptjs.compareSync as jest.Mock).mockReturnValue(false);
      
      await login(mockReq as Request, mockRes as Response);
      
      expect(bcryptjs.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid Password' });
    });
    
    it('should return user data and token on successful login', async () => {
      const mockUser = { 
        id: '1', 
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user'
      };
      
      const mockUserData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };
      
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockPrismaClient.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUserData);
      (bcryptjs.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt-token');
      
      await login(mockReq as Request, mockRes as Response);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '1', userRole: 'user' }, 
        'test-secret'
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token', 
        'mocked-jwt-token', 
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 3600000
        }
      );
      expect(mockRes.json).toHaveBeenCalledWith({ 
        data: mockUserData, 
        token: 'mocked-jwt-token' 
      });
    });
    
    it('should return 500 if an error occurs', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockPrismaClient.user.findFirst.mockRejectedValue(new Error('Database error'));
      
      await login(mockReq as Request, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  
  describe('signup', () => {
    it('should return 400 if email already exists', async () => {
      mockReq.body = { 
        email: 'existing@example.com', 
        name: 'Existing User', 
        password: 'password123',
        role: 'user'
      };
      
      mockPrismaClient.user.findFirst.mockResolvedValue({ id: '1', email: 'existing@example.com' });
      
      await signup(mockReq as Request, mockRes as Response);
      
      expect(mockPrismaClient.user.findFirst).toHaveBeenCalledWith({ 
        where: { email: 'existing@example.com' } 
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    });
    
    it('should create a new user successfully', async () => {
      const newUser = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedPassword',
        role: 'user'
      };
      
      mockReq.body = { 
        email: 'new@example.com', 
        name: 'New User', 
        password: 'password123',
        role: 'user'
      };
      
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockPrismaClient.user.create.mockResolvedValue(newUser);
      (bcryptjs.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      
      await signup(mockReq as Request, mockRes as Response);
      
      expect(bcryptjs.hashSync).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          name: 'New User',
          password: 'hashedPassword',
          role: 'user'
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newUser);
    });
    
    it('should return 500 if an error occurs during signup', async () => {
      mockReq.body = { 
        email: 'new@example.com', 
        name: 'New User', 
        password: 'password123',
        role: 'user'
      };
      
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockPrismaClient.user.create.mockRejectedValue(new Error('Database error'));
      
      await signup(mockReq as Request, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error creating user' });
    });
  });
  
  describe('logout', () => {
    it('should clear the token cookie and return success message', () => {
      logout(mockReq as Request, mockRes as Response);
      
      expect(mockRes.clearCookie).toHaveBeenCalledWith('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});