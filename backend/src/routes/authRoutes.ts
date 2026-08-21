import { Router } from 'express';
import { register, login, googleAuth, getMe } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimiter, sanitizeInputMiddleware } from '../middlewares/secMiddleware';

const router = Router();

// Public auth routes with rate limiting and sanitization
router.post('/register', authRateLimiter, sanitizeInputMiddleware, register);
router.post('/login', authRateLimiter, sanitizeInputMiddleware, login);
router.post('/google', authRateLimiter, googleAuth);

// Protected auth routes
router.get('/me', authenticateToken, getMe);

export default router;
