import jwt from 'jsonwebtoken';

export type Role = 'STUDENT' | 'ADMIN';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_student_assistant';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
