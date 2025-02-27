// validateProfile.ts
import { NextFunction, Request, Response } from "express";
import {  jobSeekerProfileSchema } from "../validations/jobSeekerProfileValidation"
import { employerProfileSchema } from "../validations/employerProfileValidation";

import { AuthRequest } from "./authMiddleware";

export const validateProfileMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userRole } = req;

  if (!userRole) {
      res.status(400).json({ message: "Role is required" });
    return 
  }

  // Validation based on role
  try {
    if (userRole === "EMPLOYER") {
      employerProfileSchema.parse(req.body);
    } else if (userRole === "JOB_SEEKER") {
      jobSeekerProfileSchema.parse(req.body);
    } else {
        res.status(400).json({ message: "Invalid role" });
      return
    }
    next();
  } catch (error:any) {
      res.status(400).json({ message: "Validation failed", errors: error.errors });
    return 
  }
};
