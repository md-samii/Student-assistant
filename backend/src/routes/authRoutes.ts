import { Router } from 'express';
import { register, login, googleAuth, getMe } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimiter, sanitizeInputMiddleware } from '../middlewares/secMiddleware';
import {
    registerSchema,
    loginSchema,
    googleAuthSchema,
} from '../validators/authValidator';

import { validateBody } from '../middlewares/validateRequest';

const router = Router();

// Public auth routes with rate limiting and sanitization
// Public auth routes with rate limiting,
// sanitization, and Zod validation

router.post(
    '/register',
    authRateLimiter,
    sanitizeInputMiddleware,
    validateBody(registerSchema),
    register
);

router.post(
    '/login',
    authRateLimiter,
    sanitizeInputMiddleware,
    validateBody(loginSchema),
    login
);

router.post(
    '/google',
    authRateLimiter,
    validateBody(googleAuthSchema),
    googleAuth
);

// Protected auth routes
router.get('/me', authenticateToken, getMe);

export default router;
