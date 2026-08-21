import { Request, Response, NextFunction } from 'express';

// In-memory rate limiting map
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10;

  const current = ipRequestCounts.get(clientIp);

  if (!current || now > current.resetTime) {
    ipRequestCounts.set(clientIp, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= maxRequests) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many login/registration attempts. Please try again after 15 minutes.',
    });
  }

  current.count += 1;
  ipRequestCounts.set(clientIp, current);
  next();
};

export const sanitizeInputMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }
  next();
};
