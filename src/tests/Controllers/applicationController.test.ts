import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../../server'; // Assuming your express app is exported from this file

// Mock the PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    job: {
      findUnique: jest.fn().mockResolvedValue({ id: 2, employerId: 1 }), // Mock job data
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 38, role: 'JOB_SEEKER' }), // Add user mock
    },
    application: {
      findFirst: jest.fn().mockResolvedValue(null), // No existing application
      create: jest.fn().mockResolvedValue({ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' }), // Mock new application
      update: jest.fn().mockResolvedValue({ id: 1, status: 'ACCEPTED' }), // Mock update application
      findMany: jest.fn().mockResolvedValue([{ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' }]), // Mock applications list
      findUnique: jest.fn().mockResolvedValue({ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' }), // Add findUnique mock
    },
  })),
}));

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake-token'),
  verify: jest.fn().mockImplementation((token, secret, callback) => {
    if (token === 'employer-token') {
      return { userId: 1, userRole: 'EMPLOYER' };
    } else if (token === 'job-seeker-token') {
      return { userId: 38, userRole: 'JOB_SEEKER' };
    }
    throw new Error('Invalid token');
  })
}));

// Mock the authentication middleware
jest.mock('../../middleware/authMiddleware', () => ({
  authMiddleware: (req: { headers: { authorization: string; }; userId: number; userRole: string; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }, next: () => void) => {
    if (req.headers.authorization === 'Bearer employer-token') {
      req.userId = 1;
      req.userRole = 'EMPLOYER';
    } else if (req.headers.authorization === 'Bearer job-seeker-token') {
      req.userId = 38;
      req.userRole = 'JOB_SEEKER';
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }
}));

// Example test setup
describe('Application API Endpoints', () => {
  // Test: Apply for a job
  it('should apply for a job', async () => {
    const res = await request(app)
      .post('/api/application/apply/2')
      .set('Authorization', 'Bearer job-seeker-token')
      .send({ jobId: 2 });

    expect(res.status).toBe(201); // Expect the status to be 201 (created)
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('PENDING');
  });

  // Test: Apply for the same job twice
  it('should not apply for the same job twice', async () => {
    // Mock the findFirst to return an existing application for the second test
    const prisma = new PrismaClient();
    (prisma.application.findFirst as jest.Mock).mockResolvedValueOnce({ id: 1, jobId: 2, jobSeekerId: 38 });
    
    const res = await request(app)
      .post('/api/application/apply/2')
      .set('Authorization', 'Bearer job-seeker-token')
      .send({ jobId: 2 });

    expect(res.status).toBe(400); // Expect a 400 (bad request) error
    expect(res.body).toHaveProperty('message', 'You have already applied for this job');
  });

  // Test: Update application status (Employer)
  it('should update the application status (Employer)', async () => {
    // Mock job ownership
    const prisma = new PrismaClient();
    (prisma.application.findUnique as jest.Mock).mockResolvedValueOnce({ id: 1, jobId: 2 });
    (prisma.job.findUnique as jest.Mock).mockResolvedValueOnce({ id: 2, employerId: 1 });
    
    const res = await request(app)
      .put('/api/application/status/1')
      .set('Authorization', 'Bearer employer-token')
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(200); // Expect the status to be 200 (OK)
    expect(res.body.status).toBe('ACCEPTED');
  });

  // Test: Should not update the application status (Non-Employer)
  it('should not update the application status (Non-Employer)', async () => {
    // Mock application and job for this test
    const prisma = new PrismaClient();
    (prisma.application.findUnique as jest.Mock).mockResolvedValueOnce({ id: 1, jobId: 2 });
    (prisma.job.findUnique as jest.Mock).mockResolvedValueOnce({ id: 2, employerId: 2 }); // Different employer
    
    const res = await request(app)
      .put('/api/application/status/1')
      .set('Authorization', 'Bearer job-seeker-token')
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(403); // Expect a 403 (Forbidden) error for non-employers
    expect(res.body).toHaveProperty('message', 'Forbidden: You can only update your own job applications');
  });

  // Test: Fetch all applications for a job (Employer)
  it('should fetch all applications for a job (Employer)', async () => {
    const res = await request(app)
      .get('/api/application/job/2')
      .set('Authorization', 'Bearer employer-token');

    expect(res.status).toBe(200); // Expect 200 (OK)
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('status');
  });

  // Test: Fetch all applications for a job seeker
  it('should fetch all applications for the job seeker', async () => {
    const res = await request(app)
      .get('/api/application/myapplies')
      .set('Authorization', 'Bearer job-seeker-token');

    expect(res.status).toBe(200); // Expect 200 (OK)
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('job');
  });
});