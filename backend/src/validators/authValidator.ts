import { z } from 'zod';

// Registration validation
export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name is too long'),

    email: z
        .string()
        .trim()
        .email('Enter a valid email address')
        .max(255, 'Email is too long'),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),

    university: z.string().trim().max(200).optional(),
    degree: z.string().trim().max(100).optional(),
    branch: z.string().trim().max(150).optional(),

    semester: z.coerce
        .number()
        .int()
        .min(1)
        .max(12)
        .optional(),

    section: z.string().trim().max(20).optional(),

    graduationYear: z.coerce
        .number()
        .int()
        .min(2000)
        .max(2100)
        .optional(),

    phone: z.string().trim().max(20).optional(),
});

// Login validation
export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Enter a valid email address')
        .max(255),

    password: z
        .string()
        .min(1, 'Password is required')
        .max(100),
});

// Google authentication validation
export const googleAuthSchema = z.object({
    credential: z
        .string()
        .min(1, 'Google credential is required'),
});