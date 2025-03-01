// profileController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config";

// Get Profile (Employer or Job Seeker)
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      res.status(404).json({ message: "Employer user not found" });
      return;
    }

    res.json(user);
    return;
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
