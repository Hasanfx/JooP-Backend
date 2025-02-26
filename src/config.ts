import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";

dotenv.config(); // Load .env variables

export const JWT_SECRET = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;


const prisma = new PrismaClient();

export { prisma };
