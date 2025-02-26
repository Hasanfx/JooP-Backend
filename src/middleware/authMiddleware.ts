import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { PrismaClient } from "@prisma/client";

// Extend Request type to include userId
export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}


export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
  
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Invalid format" });
        return;
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
  
        const decoded = jwt.verify(token, JWT_SECRET!) as any;
        
        req.userId = decoded.userId; 
        req.userRole = decoded.userRole;
        
        
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};

