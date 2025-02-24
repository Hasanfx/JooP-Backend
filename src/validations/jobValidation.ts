import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  category: z.string().min(1, "Job category is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  salary: z.number().positive("Salary must be a positive number"),
  employerId: z.number().int("Employer ID must be an integer"),
});
