import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// ✅ Apply for a job
export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req; // Assuming userId is set by the authentication middleware
    const jobId = Number(req.params.id);

    // Check if the job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Check if the user is a job seeker
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'JOB_SEEKER') {
      res.status(403).json({ message: 'Only job seekers can apply for jobs' });
      return;
    }

    // Check if the job seeker has already applied for this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        jobSeekerId: userId,
      },
    });

    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied for this job' });
      return;
    }

    // Create a new application
    if (userId !== undefined) {
      const newApplication = await prisma.application.create({
        data: {
          jobId,
          jobSeekerId: userId,
          status: 'PENDING',
        },
      });
      res.status(201).json(newApplication);
    } else {
      res.status(400).json({ message: 'User ID is undefined' });
    }

  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

// ✅ Update application status (Accepted/Rejected)
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, userRole } = req; // Assuming userId and userRole are set by the authentication middleware
    const applicationId = Number(req.params.id);
    const { status } = req.body; // Should be one of 'PENDING', 'ACCEPTED', or 'REJECTED'

    // Check if the status is valid
    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Invalid application status' });
      return;
    }

    // Check if the application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Check if the user is the employer for the job
    const job = await prisma.job.findUnique({ where: { id: application.jobId } });
    if (!job || job.employerId !== userId || userRole !== 'EMPLOYER') {
      res.status(403).json({ message: 'Forbidden: You can only update your own job applications' });
      return;
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

// ✅ Get all applications for a job (for employers)
export const getApplicationsForJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = Number(req.params.id);

    // Check if the job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
    }
    console.log(job)

    // Fetch all applications for the job
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: { jobSeeker: true }, // Include the job seeker's details
    });
    console.log(applications)

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications for job:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

// ✅ Get all applications for a job seeker
export const getApplicationsForJobSeeker = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req; // Assuming userId is set by the authentication middleware

    // Fetch all applications for the job seeker
    const applications = await prisma.application.findMany({
      where: { jobSeekerId: userId },
      include: { job: true }, // Include the job details
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications for job seeker:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};
