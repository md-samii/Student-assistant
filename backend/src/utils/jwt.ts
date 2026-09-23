import jwt from 'jsonwebtoken';

export type Role = 'STUDENT' | 'ADMIN';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const getJwtExpiresIn = (): jwt.SignOptions['expiresIn'] => {
  return (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
};

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: getJwtExpiresIn(),
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  });

  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }

  if (
    typeof decoded.userId !== 'string' ||
    typeof decoded.email !== 'string' ||
    (decoded.role !== 'STUDENT' && decoded.role !== 'ADMIN')
  ) {
    throw new Error('Invalid JWT payload');
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
};