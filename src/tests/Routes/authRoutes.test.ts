import { Router } from 'express';
import authRoutes from '../../routes/authRoutes';
import { login, signup, logout } from '../../controllers/authController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';
import { userSchema, userLoginSchema } from '../../validations/userValidation';

// Mock the router and its methods
const mockRouter = {
  post: jest.fn()
};

jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter)
}));

// Mock the route handlers and middleware
jest.mock('../../controllers/authController', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn()
}));

jest.mock('../../middleware/authMiddleware', () => jest.fn());
jest.mock('../../middleware/validationMiddleware', () => jest.fn());
jest.mock('../../validations/userValidation', () => ({
  userSchema: {},
  userLoginSchema: {}
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Initialize the routes
    authRoutes(mockRouter);
  });

  it('should configure POST /login route', () => {
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/login',
      validationMiddleware(userLoginSchema),
      login
    );
  });

  it('should configure POST /signup route', () => {
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/signup',
      validationMiddleware(userSchema),
      signup
    );
  });

  it('should configure POST /logout route', () => {
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/logout',
      authMiddleware,
      logout
    );
  });

  it('should attach authMiddleware to protected routes', () => {
    // Verify authMiddleware is used in the logout route
    expect(authMiddleware).toHaveBeenCalled();
  });

  it('should attach validationMiddleware to routes requiring validation', () => {
    // Verify validationMiddleware is used in login and signup routes
    expect(validationMiddleware).toHaveBeenCalledWith(userLoginSchema);
    expect(validationMiddleware).toHaveBeenCalledWith(userSchema);
  });
});
