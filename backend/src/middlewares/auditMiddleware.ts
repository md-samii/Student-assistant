import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import prisma from '../config/prisma';

export const auditLogger = (actionName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userId = req.user?.userId || null;

    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          await prisma.auditLog.create({
            data: {
              userId,
              action: actionName,
              ipAddress: clientIp,
              details: `${req.method} ${req.originalUrl} - Status ${res.statusCode}`,
            },
          });
        } catch (e) {
          // Silent catch for audit logging
        }
      }
    });

    next();
  };
};
