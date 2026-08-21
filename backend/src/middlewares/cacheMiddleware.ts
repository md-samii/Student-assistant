import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry>();

export const cacheMiddleware = (ttlSeconds: number = 900) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cached = memoryCache.get(key);
    const now = Date.now();

    if (cached && now < cached.expiry) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(key, {
          data: body,
          expiry: Date.now() + ttlSeconds * 1000,
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

export const clearCache = (keyPrefix?: string) => {
  if (!keyPrefix) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(keyPrefix)) {
        memoryCache.delete(key);
      }
    }
  }
};
