import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/authMiddleware';

// Mock PrismaClient
const mockPrismaClient = {
  employerProfile: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn()
  },
  jobSeekerProfile: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn()
  },
  $disconnect: jest.fn()
};

// Move the mock before importing the controller
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Import controller after mocks
import {
  createProfile,
  updateProfile,
  getProfile
} from '../../controllers/profileController';

describe('Profile Controller Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      params: {},
      body: {},
      userId: 1,
      userRole: 'EMPLOYER'
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createProfile', () => {
    describe('Employer Profile', () => {
      it('should create a new employer profile', async () => {
        const profileData = {
          companyName: 'Tech Corp',
          companyWebsite: 'www.techcorp.com'
        };

        const mockProfile = {
          id: 1,
          ...profileData,
          userId: 1
        };

        mockReq.body = profileData;
        mockReq.userRole = 'EMPLOYER';
        mockPrismaClient.employerProfile.findUnique.mockResolvedValue(null);
        mockPrismaClient.employerProfile.create.mockResolvedValue(mockProfile);

        await createProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockPrismaClient.employerProfile.create).toHaveBeenCalledWith({
          data: {
            ...profileData,
            userId: 1
          }
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      });

      it('should return 400 if employer profile already exists', async () => {
        mockReq.userRole = 'EMPLOYER';
        mockPrismaClient.employerProfile.findUnique.mockResolvedValue({ id: 1 });

        await createProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Employer profile already exists' });
      });
    });

    describe('Job Seeker Profile', () => {
      it('should create a new job seeker profile', async () => {
        const profileData = {
          resume: 'resume.pdf',
          skills: ['JavaScript', 'React']
        };

        const mockProfile = {
          id: 1,
          ...profileData,
          userId: 1
        };

        mockReq.body = profileData;
        mockReq.userRole = 'JOB_SEEKER';
        mockPrismaClient.jobSeekerProfile.findUnique.mockResolvedValue(null);
        mockPrismaClient.jobSeekerProfile.create.mockResolvedValue(mockProfile);

        await createProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockPrismaClient.jobSeekerProfile.create).toHaveBeenCalledWith({
          data: {
            ...profileData,
            userId: 1
          }
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      });
    });
  });

  describe('updateProfile', () => {
    describe('Employer Profile', () => {
      it('should update an employer profile', async () => {
        const updateData = {
          companyName: 'Updated Corp',
          companyWebsite: 'www.updated.com'
        };

        const mockProfile = {
          id: 1,
          ...updateData,
          userId: 1
        };

        mockReq.body = updateData;
        mockReq.userRole = 'EMPLOYER';
        mockPrismaClient.employerProfile.findUnique.mockResolvedValue({ id: 1 });
        mockPrismaClient.employerProfile.update.mockResolvedValue(mockProfile);

        await updateProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockPrismaClient.employerProfile.update).toHaveBeenCalledWith({
          where: { userId: 1 },
          data: updateData
        });
        expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      });

      it('should return 404 if employer profile not found', async () => {
        mockReq.userRole = 'EMPLOYER';
        mockPrismaClient.employerProfile.findUnique.mockResolvedValue(null);

        await updateProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Employer profile not found' });
      });
    });

    describe('Job Seeker Profile', () => {
      it('should update a job seeker profile', async () => {
        const updateData = {
          resume: 'updated-resume.pdf',
          skills: ['TypeScript', 'Node.js']
        };

        const mockProfile = {
          id: 1,
          ...updateData,
          userId: 1
        };

        mockReq.body = updateData;
        mockReq.userRole = 'JOB_SEEKER';
        mockPrismaClient.jobSeekerProfile.findUnique.mockResolvedValue({ id: 1 });
        mockPrismaClient.jobSeekerProfile.update.mockResolvedValue(mockProfile);

        await updateProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockPrismaClient.jobSeekerProfile.update).toHaveBeenCalledWith({
          where: { userId: 1 },
          data: updateData
        });
        expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      });
    });
  });

  describe('getProfile', () => {
    describe('Employer Profile', () => {
      it('should return an employer profile', async () => {
        const mockProfile = {
          id: 1,
          companyName: 'Tech Corp',
          userId: 1
        };

        mockReq.userRole = 'EMPLOYER';
        mockPrismaClient.employerProfile.findUnique.mockResolvedValue(mockProfile);

        await getProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockPrismaClient.employerProfile.findUnique).toHaveBeenCalledWith({
          where: { userId: 1 }
        });
        expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      });

      it('should return 404 if employer profile not found', async () => {
        mockReq.userRole = 'EMPLOYER';
        mockPrismaClient.employerProfile.findUnique.mockResolvedValue(null);

        await getProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Employer profile not found' });
      });
    });

    describe('Job Seeker Profile', () => {
      it('should return a job seeker profile', async () => {
        const mockProfile = {
          id: 1,
          resume: 'resume.pdf',
          userId: 1
        };

        mockReq.userRole = 'JOB_SEEKER';
        mockPrismaClient.jobSeekerProfile.findUnique.mockResolvedValue(mockProfile);

        await getProfile(mockReq as AuthRequest, mockRes as Response);

        expect(mockPrismaClient.jobSeekerProfile.findUnique).toHaveBeenCalledWith({
          where: { userId: 1 }
        });
        expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      });
    });
  });
});
