import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JwtPayload): string => {
  if (!JWT_SECRET) {
    throw new Error("Configuration Error: JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
  if (!JWT_SECRET) {
    throw new Error("Configuration Error: JWT_SECRET is not defined in environment variables.");
  }
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    // Catches JsonWebTokenError, TokenExpiredError, etc.
    return null; 
  }
};


export const MAX_AGE =  7 * 24 * 60 * 60 * 1000;