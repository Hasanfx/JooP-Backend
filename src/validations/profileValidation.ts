// src/validations/profileValidation.ts
import { z } from "zod";
import { employerProfileSchema } from "./employerProfileValidation";
import { jobSeekerProfileSchema } from "./jobSeekerProfileValidation";

// Base schema for user profile creation
export const profileCreationSchema = z.object({
  role: z.enum(["EMPLOYER", "JOB_SEEKER"], {
    message: "Invalid role value",
  }),
  profileData: z.union([employerProfileSchema, jobSeekerProfileSchema]), // Will be conditionally validated
});
