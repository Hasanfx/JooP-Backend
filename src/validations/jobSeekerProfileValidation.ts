import {z} from "zod";
export const jobSeekerProfileSchema = z.object({
  resume: z.string().min(1, "Resume is required"),
  skills: z.string().min(1,"").optional()
});