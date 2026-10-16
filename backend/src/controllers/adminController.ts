import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/stats
 * Aggregates high-level platform metrics for Administrator Dashboard
 */
export const getAdminStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalSubjects,
      totalResources,
      totalQuizzes,
      totalSubmissions,
      totalInternships,
      totalJobs,
      totalGovExams,
      totalAIChats,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'STUDENT' },
      }),

      prisma.user.count({
        where: {
          role: 'STUDENT',
          isActive: true,
        },
      }),

      prisma.subject.count(),

      prisma.studyResource.count(),

      prisma.quiz.count(),

      prisma.quizSubmission.count(),

      prisma.internship.count({
        where: { status: 'ACTIVE' },
      }),

      prisma.job.count({
        where: { status: 'ACTIVE' },
      }),

      prisma.governmentExam.count({
        where: { status: 'ACTIVE' },
      }),

      prisma.chatHistory.count(),

      prisma.user.findMany({
        where: { role: 'STUDENT' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          createdAt: true,
          profile: {
            select: {
              university: true,
              branch: true,
              semester: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          totalStudents,
          activeStudents,
          totalSubjects,
          totalResources,
          totalQuizzes,
          totalSubmissions,
          totalInternships,
          totalJobs,
          totalGovExams,
          totalAIChats,
        },
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin stats',
    });
  }
};

/**
 * GET /api/admin/students
 * Paginated student list with search filter
 */
export const getStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pageParam = req.query.page as string | undefined;
    const limitParam = req.query.limit as string | undefined;
    const searchParam = req.query.search as string | undefined;

    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 10;
    const search = searchParam?.trim() || '';

    // Validate pagination
    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({
        status: 'error',
        message: 'Page must be a positive integer.',
      });
      return;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        status: 'error',
        message: 'Limit must be an integer between 1 and 100.',
      });
      return;
    }

    // Prevent excessively large offsets
    const skip = (page - 1) * limit;

    const whereClause = {
      role: 'STUDENT' as const,
      ...(search
        ? {
          OR: [
            {
              fullName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
        : {}),
    };

    const total = await prisma.user.count({
      where: whereClause,
    });

    const students = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            university: true,
            branch: true,
            semester: true,
            phone: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        students,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching student list:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student list',
    });
  }
};

/**
 * PATCH /api/admin/students/:id/status
 * Toggle student active/deactivated status
 */

export const toggleStudentStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // 1. Validate the requested status
    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        status: 'error',
        message: 'isActive must be a boolean.',
      });
      return;
    }

    // 2. Find the target student
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
      return;
    }

    // 3. Only allow student accounts to be modified
    if (user.role !== 'STUDENT') {
      res.status(403).json({
        status: 'error',
        message: 'Only student accounts can be modified.',
      });
      return;
    }

    // 4. Update the student and record the audit log
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'TOGGLE_STUDENT_STATUS',
          details: `Updated student ${user.email} status to ${isActive ? 'ACTIVE' : 'DEACTIVATED'
            }`,
        },
      });

      return updated;
    });

    // 5. Return the updated student
    res.status(200).json({
      status: 'success',
      message: `Student account status updated to ${isActive ? 'Active' : 'Deactivated'
        }`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Error updating student status:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to update student status.',
    });
  }
};

/**
 * GET /api/admin/audit-logs
 * System audit log events
 */
export const getAuditLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        logs,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch audit logs',
    });
  }
};
/**
 * GET /api/admin/export/students
 * CSV Export of all registered students
 */
export const exportStudentsCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    const escapeCSV = (value: unknown): string => {
      const stringValue = String(value ?? '');

      // Prevent spreadsheet formula injection
      const safeValue = /^[=+\-@]/.test(stringValue)
        ? `'${stringValue}`
        : stringValue;

      return `"${safeValue.replace(/"/g, '""')}"`;
    };

    let csvContent =
      'ID,Full Name,Email,University,Branch,Semester,Status,Created At\n';

    users.forEach((user) => {
      const status = user.isActive ? 'ACTIVE' : 'DEACTIVATED';
      const date = new Date(user.createdAt).toISOString().split('T')[0];

      csvContent += [
        escapeCSV(user.id),
        escapeCSV(user.fullName),
        escapeCSV(user.email),
        escapeCSV(user.profile?.university),
        escapeCSV(user.profile?.branch),
        escapeCSV(user.profile?.semester ?? ''),
        escapeCSV(status),
        escapeCSV(date),
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="students_export.csv"'
    );

    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting students CSV:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to export students CSV',
    });
  }
};

/**
 * GET /api/admin/export/quizzes
 * CSV Export of quiz attempt results
 */
export const exportQuizzesCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const submissions = await prisma.quizSubmission.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        quiz: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    const escapeCSV = (value: unknown): string => {
      const stringValue = String(value ?? '');

      // Prevent spreadsheet formula injection
      const safeValue = /^[=+\-@]/.test(stringValue)
        ? `'${stringValue}`
        : stringValue;

      return `"${safeValue.replace(/"/g, '""')}"`;
    };

    let csvContent =
      'Submission ID,Student Name,Email,Quiz Title,Score,Total Marks,Percentage,Submitted At\n';

    submissions.forEach((submission) => {
      const totalMarks = submission.totalMarks || 0;

      const percentage =
        totalMarks > 0
          ? Math.round((submission.score / totalMarks) * 100)
          : 0;

      const date = new Date(submission.submittedAt)
        .toISOString()
        .split('T')[0];

      csvContent += [
        escapeCSV(submission.id),
        escapeCSV(submission.user?.fullName),
        escapeCSV(submission.user?.email),
        escapeCSV(submission.quiz?.title || 'Quiz'),
        escapeCSV(submission.score),
        escapeCSV(submission.totalMarks),
        escapeCSV(`${percentage}%`),
        escapeCSV(date),
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="quiz_submissions_export.csv"'
    );

    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting quiz CSV:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to export quiz CSV',
    });
  }
};

/**
 * GET /api/admin/reports/content-usage
 * Aggregates analytics metrics for platform report charts
 */
export const getContentUsageReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      resourceCount,
      quizCount,
      chatCount,
      submissions,
      subjects,
    ] = await Promise.all([
      prisma.studyResource.count(),

      prisma.quiz.count(),

      prisma.chatHistory.count(),

      prisma.quizSubmission.findMany({
        select: {
          score: true,
          totalMarks: true,
          submittedAt: true,
          quiz: {
            select: {
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      prisma.subject.findMany({
        select: {
          name: true,
          _count: {
            select: {
              resources: true,
              quizzes: true,
            },
          },
        },
      }),
    ]);

    /*
     * Quiz analytics
     *
     * A submission is considered passed when the student
     * scores at least 50%.
     */
    let passed = 0;
    let failed = 0;
    let totalPercentage = 0;

    submissions.forEach((submission) => {
      const percentage =
        submission.totalMarks > 0
          ? (submission.score / submission.totalMarks) * 100
          : 0;

      totalPercentage += percentage;

      if (percentage >= 50) {
        passed++;
      } else {
        failed++;
      }
    });

    const avgScorePercentage =
      submissions.length > 0
        ? Math.round(totalPercentage / submissions.length)
        : 0;

    /*
     * Subject distribution
     *
     * Uses the number of resources + quizzes associated
     * with each subject.
     */
    const subjectDistribution = subjects.map((subject) => ({
      subject: subject.name,
      count: subject._count.resources + subject._count.quizzes,
    }));

    /*
     * Daily activity
     *
     * We currently have timestamps for AI chats and quiz
     * submissions, but the schema does not contain resource
     * view events.
     */
    const dailyActivityMap = new Map<
      string,
      {
        aiQueries: number;
        quizAttempts: number;
        resourceViews: number;
      }
    >();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const key = date.toISOString().split('T')[0];

      dailyActivityMap.set(key, {
        aiQueries: 0,
        quizAttempts: 0,
        resourceViews: 0,
      });
    }

    const recentChats = await prisma.chatHistory.findMany({
      where: {
        createdAt: {
          gte: new Date(
            new Date().setDate(new Date().getDate() - 6)
          ),
        },
      },
      select: {
        createdAt: true,
      },
    });

    recentChats.forEach((chat) => {
      const key = chat.createdAt.toISOString().split('T')[0];
      const activity = dailyActivityMap.get(key);

      if (activity) {
        activity.aiQueries++;
      }
    });

    submissions.forEach((submission) => {
      const key = submission.submittedAt.toISOString().split('T')[0];
      const activity = dailyActivityMap.get(key);

      if (activity) {
        activity.quizAttempts++;
      }
    });

    const dailyActivity = Array.from(dailyActivityMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, activity]) => ({
        day: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        aiQueries: activity.aiQueries,
        quizAttempts: activity.quizAttempts,
        resourceViews: activity.resourceViews,
      }));

    res.status(200).json({
      status: 'success',
      data: {
        dailyActivity,

        quizPassRate: {
          passed,
          failed,
          avgScorePercentage,
        },

        subjectDistribution,

        overviewTotals: {
          totalResources: resourceCount,
          totalQuizzes: quizCount,
          totalAIChats: chatCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching content usage reports:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch content usage reports',
    });
  }
};
