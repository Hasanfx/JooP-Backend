import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/authMiddleware';

// Mock PrismaClient
const mockPrismaClient = {
  job: {
    findUnique: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  },
  application: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn()
  },
  $disconnect: jest.fn()
};

// Move the mock before importing the controller
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Import controller after mocks
import {
  applyForJob,
  updateApplicationStatus,
  getApplicationsForJob,
  getApplicationsForJobSeeker
} from '../../controllers/applicationController';

describe('Application Controller Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      params: {},
      body: {},
      userId: 1,
      userRole: 'JOB_SEEKER'
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('applyForJob', () => {
    it('should create a new application when valid', async () => {
      const jobId = 1;
      mockReq.params = { id: jobId.toString() };
      mockReq.userId = 1;

      // Mock job exists
      mockPrismaClient.job.findUnique.mockResolvedValue({ id: jobId, employerId: 2 });
      
      // Mock user is job seeker
      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 1, role: 'JOB_SEEKER' });
      
      // Mock no existing application
      mockPrismaClient.application.findFirst.mockResolvedValue(null);

      const mockApplication = {
        id: 1,
        jobId,
        jobSeekerId: 1,
        status: 'PENDING'
      };
      mockPrismaClient.application.create.mockResolvedValue(mockApplication);

      await applyForJob(mockReq as AuthRequest, mockRes as Response);

      expect(mockPrismaClient.application.create).toHaveBeenCalledWith({
        data: {
          jobId,
          jobSeekerId: 1,
          status: 'PENDING'
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockApplication);
    });

    it('should return 404 if job not found', async () => {
      mockReq.params = { id: '999' };
      mockPrismaClient.job.findUnique.mockResolvedValue(null);

      await applyForJob(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should return 403 if user is not a job seeker', async () => {
      mockReq.params = { id: '1' };
      mockPrismaClient.job.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 1, role: 'EMPLOYER' });

      await applyForJob(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Only job seekers can apply for jobs' });
    });

    it('should return 400 if already applied', async () => {
      mockReq.params = { id: '1' };
      mockPrismaClient.job.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 1, role: 'JOB_SEEKER' });
      mockPrismaClient.application.findFirst.mockResolvedValue({ id: 1 });

      await applyForJob(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'You have already applied for this job' });
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status when valid', async () => {
      const applicationId = 1;
      mockReq.params = { id: applicationId.toString() };
      mockReq.body = { status: 'ACCEPTED' };
      mockReq.userRole = 'EMPLOYER';
      mockReq.userId = 1;

      const mockApplication = { id: applicationId, jobId: 1 };
      mockPrismaClient.application.findUnique.mockResolvedValue(mockApplication);
      
      const mockJob = { id: 1, employerId: 1 };
      mockPrismaClient.job.findUnique.mockResolvedValue(mockJob);

      const updatedApplication = { ...mockApplication, status: 'ACCEPTED' };
      mockPrismaClient.application.update.mockResolvedValue(updatedApplication);

      await updateApplicationStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockPrismaClient.application.update).toHaveBeenCalledWith({
        where: { id: applicationId },
        data: { status: 'ACCEPTED' }
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedApplication);
    });

    it('should return 400 for invalid status', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'INVALID_STATUS' };

      await updateApplicationStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid application status' });
    });
  });

  describe('getApplicationsForJob', () => {
    it('should return applications for a job', async () => {
      const jobId = 1;
      mockReq.params = { id: jobId.toString() };

      const mockJob = { id: jobId, employerId: 1 };
      mockPrismaClient.job.findUnique.mockResolvedValue(mockJob);

      const mockApplications = [
        { id: 1, jobId, jobSeekerId: 1 },
        { id: 2, jobId, jobSeekerId: 2 }
      ];
      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      await getApplicationsForJob(mockReq as AuthRequest, mockRes as Response);

      expect(mockPrismaClient.application.findMany).toHaveBeenCalledWith({
        where: { jobId },
        include: { jobSeeker: true }
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
    });

    it('should return 404 if job not found', async () => {
      mockReq.params = { id: '999' };
      mockPrismaClient.job.findUnique.mockResolvedValue(null);

      await getApplicationsForJob(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
  });

  describe('getApplicationsForJobSeeker', () => {
    it('should return applications for the job seeker', async () => {
      const mockApplications = [
        { id: 1, jobSeekerId: 1, jobId: 1 },
        { id: 2, jobSeekerId: 1, jobId: 2 }
      ];
      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      await getApplicationsForJobSeeker(mockReq as AuthRequest, mockRes as Response);

      expect(mockPrismaClient.application.findMany).toHaveBeenCalledWith({
        where: { jobSeekerId: 1 },
        include: { job: true }
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
    });
  });
});
