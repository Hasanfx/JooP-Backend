import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../../server'; // Assuming your express app is exported from this file

// Mock the PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    job: {
      findUnique: jest.fn().mockResolvedValue({ id: 2 }), // Mock job data
    },
    application: {
      findFirst: jest.fn().mockResolvedValue(null), // No existing application
      create: jest.fn().mockResolvedValue({ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' }), // Mock new application
      update: jest.fn().mockResolvedValue({ id: 1, status: 'ACCEPTED' }), // Mock update application
      findMany: jest.fn().mockResolvedValue([{ id: 1, jobId: 2, jobSeekerId: 38, status: 'PENDING' }]), // Mock applications list
    },
  })),
}));

// Mock the JWT secret for generating tokens
jest.mock('../../config', () => ({
  JWT_SECRET: 'hasan10203040',
}));

// Function to generate JWT token for testing
const generateMockToken = (payload: object) => {
  return jwt.sign(payload, 'hasan10203040', { expiresIn: '1h' });
};

// Example test setup
describe('Application API Endpoints', () => {
  let employerCookie: string;
  let jobSeekerCookie: string;

  beforeAll(() => {
    // Generate mock JWT tokens for employer and job seeker
    employerCookie = `token=${generateMockToken({ userId: 1, userRole: 'EMPLOYER' })}`;
    jobSeekerCookie = `token=${generateMockToken({ userId: 38, userRole: 'JOB_SEEKER' })}`;
  });

  // Test: Apply for a job
  it('should apply for a job', async () => {
    const res = await request(app)
      .post('/api/application/apply/2') // Assuming the route is "/applications/:id"
      .set('Cookie', jobSeekerCookie)
      .send({ jobId: 2 });

    expect(res.status).toBe(201); // Expect the status to be 201 (created)
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('PENDING');
  });

  // Test: Apply for the same job twice
  it('should not apply for the same job twice', async () => {
    const res = await request(app)
      .post('/api/application/apply/2') // Same job ID
      .set('Cookie', jobSeekerCookie)
      .send({ jobId: 2 });

    expect(res.status).toBe(400); // Expect a 400 (bad request) error
    expect(res.body).toHaveProperty('message', 'You have already applied for this job');
  });

  // Test: Update application status (Employer)
  it('should update the application status (Employer)',
     async () => {
    const res = await request(app)
      .put('/api/application/status/1') // Assuming application ID is 1
      .set('Cookie', employerCookie)
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(200); // Expect the status to be 200 (OK)
    expect(res.body.status).toBe('ACCEPTED');
  });

  // Test: Should not update the application status (Non-Employer)
  it('should not update the application status (Non-Employer)', async () => {
    const res = await request(app)
      .put('/application/status/1')
      .set('Cookie', jobSeekerCookie) // Job seeker is not allowed to update
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(403); // Expect a 403 (Forbidden) error for non-employers
    expect(res.body).toHaveProperty('message', 'Forbidden: You can only update your own job applications');
  });

  // Test: Fetch all applications for a job (Employer)
  it('should fetch all applications for a job (Employer)', async () => {
    const res = await request(app)
      .get('/application/job/2') // Assuming route is "/applications/job/:id"
      .set('Cookie', employerCookie);

    expect(res.status).toBe(200); // Expect 200 (OK)
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('status');
  });

  // Test: Fetch all applications for a job seeker
  it('should fetch all applications for the job seeker', async () => {
    const res = await request(app)
      .get('/api/application/myapplies') // Assuming route is "/applications/job-seeker"
      .set('Cookie', jobSeekerCookie);

    expect(res.status).toBe(200); // Expect 200 (OK)
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('job');
  });
});
