import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, Role } from '../utils/jwt';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Fallback in-memory user storage if SQLite DB is initializing


export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      university,
      degree,
      branch,
      semester,
      section,
      graduationYear,
      phone,
    } = req.body;

    // 1. Basic validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Full name, email, and password are required.',
      });
    }

    // 2. Normalize input
    const cleanEmail = email.toLowerCase().trim();
    const cleanFullName = fullName.trim();

    // 3. Check if account already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }

    // 4. Hash password
    const passwordHash = await hashPassword(password);

    // 5. Create user + student profile atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: cleanFullName,
          email: cleanEmail,
          passwordHash,
          role: 'STUDENT',
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          university:
            university?.trim() ||
            'Visvesvaraya Technological University (VTU)',
          degree: degree?.trim() || 'B.E.',
          branch:
            branch?.trim() ||
            'Computer Science & Engineering',
          semester: semester ? parseInt(semester, 10) : 5,
          section: section?.trim() || 'A',
          graduationYear: graduationYear
            ? parseInt(graduationYear, 10)
            : new Date().getFullYear() + 2,
          phone: phone?.trim() || null,
        },
      });

      return { user, profile };
    });

    // 6. Generate JWT
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as Role,
    });

    // 7. Send response
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: result.user.id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        },
        profile: result.profile,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to create account. Please try again later.',
    });
  }
};

export const googleAuth = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { credential } = req.body;

    // 1. Make sure Google sent an ID token
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Google authentication token is required.',
      });
    }

    // 2. Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 3. Get the verified Google account information
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Google authentication token.',
      });
    }

    // 4. Make sure the Google account has a verified email
    if (!payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        status: 'error',
        message: 'Google email address is not verified.',
      });
    }

    // 5. Google's stable account identifier
    const googleId = payload.sub;

    const cleanEmail = payload.email.toLowerCase().trim();

    // 6. Look for an existing user
    let user = await prisma.user.findUnique({
      where: {
        googleId,
      },
      include: {
        profile: true,
      },
    });

    // 7. If no Google-linked account exists, check email
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          email: cleanEmail,
        },
        include: {
          profile: true,
        },
      });
    }

    // 8. Create a new Student account if necessary
    if (!user) {
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            fullName: payload.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            googleId,
            passwordHash: null,
            role: 'STUDENT',
          },
        });

        const newProfile = await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            university: '',
            degree: '',
            branch: '',
            semester: 1,
            section: '',
            graduationYear: new Date().getFullYear(),
            profilePicture: payload.picture || null,
          },
        });

        return {
          ...newUser,
          profile: newProfile,
        };
      });

      user = result;
    } else {
      // 9. Don't allow a disabled account to log in
      if (!user.isActive) {
        return res.status(403).json({
          status: 'error',
          message: 'Your account has been disabled.',
        });
      }

      // 10. Link Google account if this existing account doesn't have one
      if (!user.googleId) {
        user = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            googleId,
          },
          include: {
            profile: true,
          },
        });
      }
    }

    // 11. Generate our application's JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Google authentication successful.',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);

    return res.status(401).json({
      status: 'error',
      message: 'Google authentication failed.',
    });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    // 2. Normalize email
    const cleanEmail = email.toLowerCase().trim();

    // 3. Find user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
      include: {
        profile: true,
      },
    });

    // 4. Do not reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email address or password.',
      });
    }

    // 5. Check account status
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been disabled.',
      });
    }

    // 6. Check whether this is a Google-only account
    if (!user.passwordHash) {
      return res.status(401).json({
        status: 'error',
        message:
          'This account uses Google Sign-In. Please continue with Google.',
      });
    }

    // 7. Verify password
    const isMatch = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email address or password.',
      });
    }

    // 8. Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    // 9. Return authenticated user
    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to process login. Please try again later.',
    });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // 1. Make sure authentication middleware attached the user
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated.',
      });
    }

    // 2. Find the actual user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        profile: true,
      },
    });

    // 3. JWT may be valid, but the account may no longer exist
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User account no longer exists.',
      });
    }

    // 4. Check whether the account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been disabled.',
      });
    }

    // 5. Return the real database user
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to fetch user information. Please try again later.',
    });
  }
};