import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";
import {prisma} from '../config'

// const prisma = new PrismaClient();

// ✅ Get a single job by ID
export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.json(job);
  } catch (error) {
    console.log("Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all jobs (for homepage, public)
export const getAllJobs = async (_req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs);
  } catch (error) {
    console.log("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all jobs by the logged-in employer
export const getJobsByEmployer = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    const jobs = await prisma.job.findMany({ where: { employerId: userId } });

    res.json(jobs);
  } catch (error) {
    console.log("Error fetching employer jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create a new job
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, userRole } = req;

    if (userRole !== "EMPLOYER") {
      res.status(403).json({ message: "Forbidden: Only employers can create jobs" });
      return;
    }

    const { title, description, company, location, salary, category } = req.body;

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        salary,
        category,
        employerId: userId!,
        // give me a json request to try

        
        // 
      },
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.log("Error creating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update job details
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    const jobId = Number(req.params.id);

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (job.employerId !== userId) {
      res.status(403).json({ message: "Forbidden: You can only update your own jobs" });
      return;
    }

    
    const { title, description, company,salary,category,location } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { title, description, company,salary,category,location },
    });

    res.json(updatedJob);
  } catch (error) {
    console.log("Error updating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a job
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    const jobId = Number(req.params.id);

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (job.employerId !== userId) {
      res.status(403).json({ message: "Forbidden: You can only delete your own jobs" });
      return;
    }

    await prisma.job.delete({ where: { id: jobId } });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log("Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};
