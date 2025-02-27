import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../../server';

// Mock the config module first
jest.mock('../../config', () => {
  // Define mock implementations inside the mock
  const mockPrisma = {
    job: {
      findUnique: jest.fn().mockResolvedValue({ id: 2, employerId: 1 })
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 38, role: 'JOB_SEEKER' })
    },
    application: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' }),
      update: jest.fn().mockResolvedValue({ id: 1, status: 'ACCEPTED' }),
      findMany: jest.fn().mockResolvedValue([{ 
        id: 1, 
        jobId: 2, 
        jobSeekerId: 38, 
        status: 'PENDING',
        job: {  // Added job details
          id: 2,
          title: 'Software Engineer',
          employerId: 1
        }
      }]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' })
    }
  };

  return {
    JWT_SECRET: 'hasan10203040',
    prisma: mockPrisma
  };
});

// Get the mocked prisma instance for use in tests
const { prisma: mockPrisma } = jest.requireMock('../../config');

// Function to generate real JWT tokens for testing
const generateToken = (payload: { userId: number; userRole: string }) => {
  return jwt.sign(payload, 'hasan10203040', { expiresIn: '1h' });
};

describe('Application API Endpoints', () => {
  const employerToken = generateToken({ userId: 1, userRole: 'EMPLOYER' });
  const jobSeekerToken = generateToken({ userId: 38, userRole: 'JOB_SEEKER' });

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to default values
    mockPrisma.job.findUnique.mockResolvedValue({ id: 2, employerId: 1 });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 38, role: 'JOB_SEEKER' });
    mockPrisma.application.findFirst.mockResolvedValue(null);
  });

  it('should apply for a job', async () => {
    const res = await request(app)
      .post('/api/application/apply/2')
      .set('Authorization', `Bearer ${jobSeekerToken}`)
      .send({ jobId: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('PENDING');
  });

  it('should not apply for the same job twice', async () => {
    mockPrisma.application.findFirst.mockResolvedValueOnce({ 
      id: 1, 
      jobId: 2, 
      jobSeekerId: 38 
    });
    
    const res = await request(app)
      .post('/api/application/apply/2')
      .set('Authorization', `Bearer ${jobSeekerToken}`)
      .send({ jobId: 2 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'You have already applied for this job');
  });

  it('should update the application status (Employer)', async () => {
    mockPrisma.application.findUnique.mockResolvedValueOnce({ id: 1, jobId: 2 });
    mockPrisma.job.findUnique.mockResolvedValueOnce({ id: 2, employerId: 1 });
    
    const res = await request(app)
      .put('/api/application/status/1')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACCEPTED');
  });

  it('should not update the application status (Non-Employer)', async () => {
    mockPrisma.application.findUnique.mockResolvedValueOnce({ id: 1, jobId: 2 });
    mockPrisma.job.findUnique.mockResolvedValueOnce({ id: 2, employerId: 2 }); // Different employer
    
    const res = await request(app)
      .put('/api/application/status/1')
      .set('Authorization', `Bearer ${jobSeekerToken}`)
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: You can only update your own job applications');
  });

  it('should fetch all applications for a job (Employer)', async () => {
    const res = await request(app)
      .get('/api/application/job/2')
      .set('Authorization', `Bearer ${employerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('status');
  });

  it('should fetch all applications for the job seeker', async () => {
    const res = await request(app)
      .get('/api/application/myapplies')
      .set('Authorization', `Bearer ${jobSeekerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('job');
  });
});
