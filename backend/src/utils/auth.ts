import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserResponse } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'blockchain-file-manager-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: UserResponse): string => {
  const payload = {
    id: user.id,
    email: user.email
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}