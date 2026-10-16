import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { getSubjectsForProfile } from '../utils/subjectSeed';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        profile: true,
        skills: true,
        projects: true,
        documents: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User profile not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        profile: user.profile,
        skills: user.skills || [],
        projects: user.projects || [],
        documents: user.documents || [],
      },
    });
  } catch (error) {
    console.error('getProfile Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to load profile.',
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const {
      fullName,
      university,
      degree,
      branch,
      semester,
      section,
      graduationYear,
      phone,
      bio,
      githubUrl,
      linkedinUrl,
    } = req.body;

    if (!fullName || !university || !degree || !branch) {
      res.status(400).json({
        status: 'error',
        message: 'Full name, university, degree, and branch are required.',
      });
      return;
    }

    if (
      semester !== undefined &&
      (!Number.isInteger(Number(semester)) ||
        Number(semester) < 1 ||
        Number(semester) > 8)
    ) {
      res.status(400).json({
        status: 'error',
        message: 'Semester must be a number between 1 and 8.',
      });
      return;
    }

    if (
      graduationYear !== undefined &&
      (!Number.isInteger(Number(graduationYear)) ||
        Number(graduationYear) < 2000 ||
        Number(graduationYear) > 2100)
    ) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid graduation year.',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.userId,
      },
      data: {
        fullName,
        profile: {
          upsert: {
            create: {
              university,
              degree,
              branch,
              semester: semester !== undefined ? Number(semester) : 1,
              section: section || null,
              graduationYear:
                graduationYear !== undefined
                  ? Number(graduationYear)
                  : new Date().getFullYear(),
              phone: phone || null,
              bio: bio || null,
              githubUrl: githubUrl || null,
              linkedinUrl: linkedinUrl || null,
            },
            update: {
              university,
              degree,
              branch,
              ...(semester !== undefined && {
                semester: Number(semester),
              }),
              section: section || null,
              ...(graduationYear !== undefined && {
                graduationYear: Number(graduationYear),
              }),
              phone: phone || null,
              bio: bio || null,
              githubUrl: githubUrl || null,
              linkedinUrl: linkedinUrl || null,
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
        },
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    console.error('updateProfile Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile.',
    });
  }
};

export const upgradeSemester = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
      return;
    }

    if (!user.profile) {
      res.status(404).json({
        status: 'error',
        message: 'Student profile not found.',
      });
      return;
    }

    const currentSemester = user.profile.semester;

    if (currentSemester >= 8) {
      res.status(400).json({
        status: 'error',
        message: 'Student is already in the final semester.',
      });
      return;
    }

    const nextSemester = currentSemester + 1;

    const updatedProfile = await prisma.studentProfile.update({
      where: {
        userId,
      },
      data: {
        semester: nextSemester,
      },
    });


    const subjects = getSubjectsForProfile(
      user.profile.branch,
      nextSemester
    );

    const formattedSubjects = subjects.map((subject) => ({
      ...subject,
      modulesCount: 5,
    }));


    res.status(200).json({
      status: 'success',
      message: `Semester upgraded to ${nextSemester}.`,
      data: {
        profile: updatedProfile,
        subjects,
      },
    });
  } catch (error) {
    console.error('upgradeSemester Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to upgrade semester.',
    });
  }
};



export const getPersonalizedSubjects = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
      return;
    }

    if (!user.profile) {
      res.status(404).json({
        status: 'error',
        message: 'Student profile not found.',
      });
      return;
    }

    const { branch, semester } = user.profile;

    const subjects = getSubjectsForProfile(branch, semester);

    res.status(200).json({
      status: 'success',
      data: {
        branch,
        semester,
        subjects,
      },
    });
  } catch (error) {
    console.error('getPersonalizedSubjects Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to load personalized subjects.',
    });
  }
};



export const exportUserData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        profile: true,
        skills: true,
        projects: true,
        documents: true,
        quizSubmissions: true,
        chatHistories: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },

      profile: user.profile,

      skills: user.skills,

      projects: user.projects,

      documents: user.documents,

      quizSubmissions: user.quizSubmissions,

      chatHistories: user.chatHistories,
    };

    res.status(200).json({
      status: 'success',
      data: exportData,
    });
  } catch (error) {
    console.error('exportUserData Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to export user data.',
    });
  }
};
