import { z } from "zod";

// User Role Enum Validation
const userRoleEnum = ["JOB_SEEKER", "EMPLOYER"] as const;

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(userRoleEnum).refine(val => userRoleEnum.includes(val), {
    message: "Invalid role value", // Custom error message
  }),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
