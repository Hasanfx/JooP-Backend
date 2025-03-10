import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validationMiddleware = (schema: z.ZodType<any, any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); 
      next(); 
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: err.errors });
      } else {
        res.status(400).json({ message: "Validation failed", errors: "Unknown error" });
      }
    }
  };
};
