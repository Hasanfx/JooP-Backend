import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ Get Profile (Employer or Job Seeker based on role)
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { userRole } = req; // Assuming the role is provided in the body or token
    console.log(userId)
    // Check if the role is 'EMPLOYER' or 'JOB_SEEKER'
    if (userRole === "EMPLOYER") {
      const profile = await prisma.employerProfile.findUnique({
        where: { userId: Number(userId) },
      });

      if (!profile) {
        res.status(404).json({ message: "Employer profile not found" });
        return;
      }

      res.json(profile);
    } else if (userRole === "JOB_SEEKER") {
      const profile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: Number(userId) },
      });

      if (!profile) {
        res.status(404).json({ message: "Job seeker profile not found" });
        return;
      }

      res.json(profile);
    } else {
      res.status(400).json({ message: "Invalid role" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create Profile (Employer or Job Seeker)
export const createProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, companyWebsite, resume, skills } = req.body;
    const { userRole } = req;
    const userId = req.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    console.log(userRole)

    if (userRole === "EMPLOYER") {
      const existingProfile = await prisma.employerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        res.status(400).json({ message: "Employer profile already exists" });
        return;
      }

      const newProfile = await prisma.employerProfile.create({
        data: {
          userId,
          companyName,
          companyWebsite,
        },
      });

      res.status(201).json(newProfile);
    } else if (userRole === "JOB_SEEKER") {
      const existingProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        res.status(400).json({ message: "Job seeker profile already exists" });
        return;
      }

      const newProfile = await prisma.jobSeekerProfile.create({
        data: {
          userId,
          resume,
          skills,
        },
      });

      res.status(201).json(newProfile);
    } else {
      res.status(400).json({ message: "Invalid role" });
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Profile (Employer or Job Seeker)
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      console.log("Params received:", req.params); // Debugging
      console.log("User ID (raw):", req.params.id); // Debugging
  
      const userId = Number(req.params.id);
      console.log(userId)
  
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid or missing user ID" });
        return;
      }
  
      console.log("Parsed User ID:", userId);
  
      const { companyName, companyWebsite, resume, skills } = req.body;
      const { userRole } = req;
  
      if (userRole === "EMPLOYER") {
        const existingProfile = await prisma.employerProfile.findUnique({
          where: { userId },
        });
  
        if (!existingProfile) {
          res.status(404).json({ message: "Employer profile not found" });
          return;
        }
  
        const updatedProfile = await prisma.employerProfile.update({
          where: { userId },
          data: { companyName, companyWebsite },
        });
  
        res.json(updatedProfile);
      } else if (userRole === "JOB_SEEKER") {
        const existingProfile = await prisma.jobSeekerProfile.findUnique({
          where: { userId },
        });
  
        if (!existingProfile) {
          res.status(404).json({ message: "Job seeker profile not found" });
          return;
        }
  
        const updatedProfile = await prisma.jobSeekerProfile.update({
          where: { userId },
          data: { resume, skills },
        });
  
        res.json(updatedProfile);
      } else {
        res.status(400).json({ message: "Invalid role" });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
