// profileController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// Get Profile (Employer or Job Seeker)
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userRole, userId } = req; 
    if (userRole === "EMPLOYER") {
      const profile = await prisma.employerProfile.findUnique({
        where: { userId: Number(userId) },
      });

      if (!profile) {
        res.status(404).json({ message: "Employer profile not found" });
        return 
      }

      res.json(profile);
      return 
    } else if (userRole === "JOB_SEEKER") {
      const profile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: Number(userId) },
      });

      if (!profile) {
        res.status(404).json({ message: "Job seeker profile not found" });
        return
      }

      res.json(profile);
      return 
    } else {
      res.status(400).json({ message: "Invalid role" });
      return
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
    return
  }
};

// Create Profile (Employer or Job Seeker)
export const createProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, companyWebsite, resume, skills } = req.body;
    const { userRole } = req;
    const userId = req.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return
    }

    if (userRole === "EMPLOYER") {
      const existingProfile = await prisma.employerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        res.status(400).json({ message: "Employer profile already exists" });
        return
      }

      const newProfile = await prisma.employerProfile.create({
        data: {
          userId,
          companyName,
          companyWebsite,
        },
      });

      res.status(201).json(newProfile);
      return
    } else if (userRole === "JOB_SEEKER") {
      const existingProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        res.status(400).json({ message: "Job seeker profile already exists" });
        return 
      }

      const newProfile = await prisma.jobSeekerProfile.create({
        data: {
          userId,
          resume,
          skills,
        },
      });

      res.status(201).json(newProfile);
      return
    } else {
      res.status(400).json({ message: "Invalid role" });
      return
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
    return
  }
};

// Update Profile (Employer or Job Seeker)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userRole, userId } = req;
    const { companyName, companyWebsite, resume, skills } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return
    }

    if (userRole === "EMPLOYER") {
      const existingProfile = await prisma.employerProfile.findUnique({
        where: { userId },
      });

      if (!existingProfile) {
        res.status(404).json({ message: "Employer profile not found" });
        return 
      }

      const updatedProfile = await prisma.employerProfile.update({
        where: { userId },
        data: { companyName, companyWebsite },
      });

      res.json(updatedProfile);
      return 
    } else if (userRole === "JOB_SEEKER") {
      const existingProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId },
      });

      if (!existingProfile) {
        res.status(404).json({ message: "Job seeker profile not found" });
        return 
      }

      const updatedProfile = await prisma.jobSeekerProfile.update({
        where: { userId },
        data: { resume, skills },
      });

      res.json(updatedProfile);
      return
    } else {
      res.status(400).json({ message: "Invalid role" });
      return 
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
    return
  }
};
