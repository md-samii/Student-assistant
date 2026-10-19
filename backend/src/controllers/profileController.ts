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
      skills,
    } = req.body;

    if (!fullName) {
      res.status(400).json({
        status: 'error',
        message: 'Full name is required.',
      });
      return;
    }

    const effectiveUniversity =
      university || 'Visvesvaraya Technological University (VTU)';
    const effectiveDegree = degree || 'B.E.';
    const effectiveBranch = branch || 'Computer Science & Engineering';

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

    // Sync skills if provided
    if (Array.isArray(skills)) {
      const skillNames: string[] = Array.from(
        new Set(
          skills
            .map((s: any) =>
              typeof s === 'string' ? s.trim() : (s?.name || '').trim()
            )
            .filter((name: string) => name.length > 0)
        )
      );

      await prisma.skill.deleteMany({
        where: { userId: req.user.userId },
      });

      if (skillNames.length > 0) {
        await prisma.skill.createMany({
          data: skillNames.map((name) => ({
            userId: req.user!.userId,
            name,
          })),
        });
      }
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
              university: effectiveUniversity,
              degree: effectiveDegree,
              branch: effectiveBranch,
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
              university: effectiveUniversity,
              degree: effectiveDegree,
              branch: effectiveBranch,
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
        skills: true,
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
        skills: updatedUser.skills || [],
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
    const querySemester = req.query.semester ? Number(req.query.semester) : undefined;
    const effectiveSemester =
      querySemester && Number.isInteger(querySemester) && querySemester >= 1 && querySemester <= 8
        ? querySemester
        : semester;

    const dbSubjects = await prisma.subject.findMany({
      where: {
        semester: effectiveSemester,
      },
      include: {
        _count: {
          select: { resources: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    const subjects =
      dbSubjects.length > 0
        ? dbSubjects.map((s) => ({
            code: s.code,
            name: s.name,
            semester: s.semester,
            branch: s.branch,
            university: s.university,
            description: s.description,
            modulesCount: 5,
            resourcesCount: s._count.resources,
          }))
        : getSubjectsForProfile(branch, effectiveSemester);

    res.status(200).json({
      status: 'success',
      data: {
        branch,
        semester: effectiveSemester,
        profileSemester: semester,
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

      documents: user.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        fileUrl: doc.fileUrl,
        storagePath: doc.storagePath,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),

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
