// Mock PrismaClient globally
const mockPrismaClient = {
  job: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $disconnect: jest.fn()
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));



import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/authMiddleware';
import { 
  getJobById, 
  getAllJobs, 
  getJobsByEmployer, 
  createJob, 
  updateJob, 
  deleteJob 
} from '../../controllers/jobController'; // Adjust path as needed





describe('Job Controller Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup request and response mocks
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
  
  describe('getJobById', () => {
    it('should return a job when valid ID is provided', async () => {
      // Arrange
      const mockJob = { 
        id: 1, 
        title: 'Software Engineer', 
        employerId: 1
      };
      mockReq.params = { id: '1' };
      mockPrismaClient.job.findUnique.mockResolvedValue(mockJob);
      
      // Act
      await getJobById(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.findUnique).toHaveBeenCalledWith({ 
        where: { id: 1 } 
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockJob);
    });
    
    it('should return 404 when job is not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      mockPrismaClient.job.findUnique.mockResolvedValue(null);
      
      // Act
      await getJobById(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.findUnique).toHaveBeenCalledWith({ 
        where: { id: 999 } 
      });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
    
    it('should return 500 when an error occurs', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockPrismaClient.job.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Act
      await getJobById(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  
  describe('getAllJobs', () => {
    it('should return all jobs', async () => {
      // Arrange
      const mockJobs = [
        { id: 1, title: 'Software Engineer' },
        { id: 2, title: 'Product Manager' }
      ];
      mockPrismaClient.job.findMany.mockResolvedValue(mockJobs);
      
      // Act
      await getAllJobs(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.findMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockJobs);
    });
    
    it('should return 500 when an error occurs', async () => {
      // Arrange
      mockPrismaClient.job.findMany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await getAllJobs(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  
  describe('getJobsByEmployer', () => {
    it('should return all jobs for the logged-in employer', async () => {
      // Arrange
      const mockJobs = [
        { id: 1, title: 'Software Engineer', employerId: 1 },
        { id: 2, title: 'Product Manager', employerId: 1 }
      ];
      mockPrismaClient.job.findMany.mockResolvedValue(mockJobs);
      
      // Act
      await getJobsByEmployer(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.findMany).toHaveBeenCalledWith({ 
        where: { employerId: 1 } 
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockJobs);
    });
    
    it('should return 500 when an error occurs', async () => {
      // Arrange
      mockPrismaClient.job.findMany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await getJobsByEmployer(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  
  describe('createJob', () => {
    it('should create a new job when user is an employer', async () => {
      // Arrange
      const jobData = {
        title: 'Software Engineer',
        description: 'Write code',
        company: 'Tech Corp',
        location: 'Remote',
        salary: 100000,
        category: 'Technology'
      };
      
      const mockCreatedJob = {
        id: 1,
        ...jobData,
        employerId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockReq.body = jobData;
      mockPrismaClient.job.create.mockResolvedValue(mockCreatedJob);
      
      // Act
      await createJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.create).toHaveBeenCalledWith({
        data: {
          ...jobData,
          employerId: 1
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedJob);
    });
    
    it('should return 403 when user is not an employer', async () => {
      // Arrange
      mockReq.userRole = 'APPLICANT';
      
      // Act
      await createJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Forbidden: Only employers can create jobs' 
      });
    });
    
    it('should return 500 when an error occurs', async () => {
      // Arrange
      mockReq.body = { title: 'Software Engineer' };
      mockPrismaClient.job.create.mockRejectedValue(new Error('Database error'));
      
      // Act
      await createJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  
  describe('updateJob', () => {
    it('should update a job when user is the owner', async () => {
      // Arrange
      const jobId = 1;
      const existingJob = {
        id: jobId,
        title: 'Old Title',
        description: 'Old Description',
        company: 'Old Company',
        employerId:1 
      };
      
      const updateData = {
        title: 'New Title',
        description: 'New Description',
        company: 'New Company'
      };
      
      const updatedJob = {
        ...existingJob,
        ...updateData
      };
      
      mockReq.params = { id: jobId.toString() };
      mockReq.body = updateData;
      mockPrismaClient.job.findUnique.mockResolvedValue(existingJob);
      mockPrismaClient.job.update.mockResolvedValue(updatedJob);
      
      // Act
      await updateJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.findUnique).toHaveBeenCalledWith({ 
        where: { id: jobId } 
      });
      expect(mockPrismaClient.job.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: updateData
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedJob);
    });
    
    it('should return 404 when job is not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      mockPrismaClient.job.findUnique.mockResolvedValue(null);
      
      // Act
      await updateJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
    
    it('should return 403 when user is not the owner', async () => {
      // Arrange
      const jobId = 1;
      const existingJob = {
        id: jobId,
        title: 'Job Title',
        employerId: 'anotherUser'
      };
      
      mockReq.params = { id: jobId.toString() };
      mockPrismaClient.job.findUnique.mockResolvedValue(existingJob);
      
      // Act
      await updateJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Forbidden: You can only update your own jobs' 
      });
    });
    
    it('should return 500 when an error occurs', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockPrismaClient.job.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Act
      await updateJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  
  describe('deleteJob', () => {
    it('should delete a job when user is the owner', async () => {
      // Arrange
      const jobId = 1;
      const existingJob = {
        id: jobId,
        title: 'Job Title',
        employerId: 1
      };
      
      mockReq.params = { id: jobId.toString() };
      mockPrismaClient.job.findUnique.mockResolvedValue(existingJob);
      
      // Act
      await deleteJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.findUnique).toHaveBeenCalledWith({ 
        where: { id: jobId } 
      });
      expect(mockPrismaClient.job.delete).toHaveBeenCalledWith({
        where: { id: jobId }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Job deleted successfully' 
      });
    });
    
    it('should return 404 when job is not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      mockPrismaClient.job.findUnique.mockResolvedValue(null);
      
      // Act
      await deleteJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.delete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
    
    it('should return 403 when user is not the owner', async () => {
      // Arrange
      const jobId = 1;
      const existingJob = {
        id: jobId,
        title: 'Job Title',
        employerId: 'anotherUser'
      };
      
      mockReq.params = { id: jobId.toString() };
      mockPrismaClient.job.findUnique.mockResolvedValue(existingJob);
      
      // Act
      await deleteJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockPrismaClient.job.delete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Forbidden: You can only delete your own jobs' 
      });
    });
    
    it('should return 500 when an error occurs', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockPrismaClient.job.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Act
      await deleteJob(mockReq as AuthRequest, mockRes as Response);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
});
