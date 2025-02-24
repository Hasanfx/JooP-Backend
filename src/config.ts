import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

export const JWT_SECRET = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;