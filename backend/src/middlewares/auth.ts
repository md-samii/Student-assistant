import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload, Role } from '../utils/jwt';
import prisma from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify the JWT
    const decoded = verifyToken(token);

    // 2. Find the user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // 3. Make sure the user still exists
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User account no longer exists.',
      });
    }

    // 4. Make sure the account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been disabled.',
      });
    }

    // 5. Use the CURRENT role from the database
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  };
};