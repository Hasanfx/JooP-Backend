import { z } from "zod";

// Application Status Enum Validation
const applicationStatusEnum = ["PENDING", "ACCEPTED", "REJECTED"] as const;

export const applicationSchema = z.object({
  jobId: z.number().int("Job ID must be an integer"),
  jobSeekerId: z.number().int("Job Seeker ID must be an integer"),
  status: z.enum(applicationStatusEnum).refine(val => applicationStatusEnum.includes(val), {
    message: "Invalid application status", // Custom error message
  }),
});
