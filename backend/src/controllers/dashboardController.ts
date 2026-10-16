import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

export const getDashboard = async (
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

        // Get current user and profile
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

        const profile = user.profile;

        // Get subjects matching the student's profile
        const subjects = profile
            ? await prisma.subject.findMany({
                where: {
                    university: profile.university,
                    branch: profile.branch,
                    semester: profile.semester,
                },
            })
            : [];

        // Get user's quiz submissions
        const quizSubmissions = await prisma.quizSubmission.findMany({
            where: {
                userId,
            },
            select: {
                score: true,
                totalMarks: true,
            },
        });

        // Get active internships
        const internships = await prisma.internship.findMany({
            where: {
                status: 'ACTIVE',
            },
            select: {
                id: true,
                deadline: true,
            },
        });

        // Get counts and resources
        const [projectsCount, documentsCount, skillsCount, resources] =
            await Promise.all([
                prisma.project.count({
                    where: {
                        userId,
                    },
                }),

                prisma.document.count({
                    where: {
                        userId,
                    },
                }),

                prisma.skill.count({
                    where: {
                        userId,
                    },
                }),

                prisma.studyResource.findMany({
                    where: {
                        subject: {
                            university: profile?.university || '',
                            branch: profile?.branch || '',
                            semester: profile?.semester || 0,
                        },
                    },
                    select: {
                        moduleNumber: true,
                    },
                }),
            ]);

        // Quiz statistics
        const solvedQuizzes = quizSubmissions.length;

        const averageAccuracy =
            solvedQuizzes > 0
                ? Math.round(
                    quizSubmissions.reduce((sum, submission) => {
                        if (submission.totalMarks === 0) {
                            return sum;
                        }

                        return (
                            sum +
                            (submission.score / submission.totalMarks) * 100
                        );
                    }, 0) / solvedQuizzes
                )
                : 0;

        // Count unique modules
        const uniqueModules = new Set(
            resources.map((resource) => resource.moduleNumber)
        );

        // Count internship deadlines within next 7 days
        const now = new Date();

        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const deadlinesThisWeek = internships.filter((internship) => {
            if (!internship.deadline) {
                return false;
            }

            return (
                internship.deadline >= now &&
                internship.deadline <= nextWeek
            );
        }).length;

        // Send dashboard data
        res.status(200).json({
            status: 'success',

            data: {
                student: {
                    name: user.fullName,
                    email: user.email,
                    university: profile?.university || null,
                    branch: profile?.branch || null,
                    semester: profile?.semester || null,
                },

                academics: {
                    subjects: subjects.length,
                    modules: uniqueModules.size,
                },

                quizzes: {
                    solved: solvedQuizzes,
                    averageAccuracy,
                },

                careers: {
                    internships: internships.length,
                    deadlinesThisWeek,
                },

                projects: {
                    total: projectsCount,
                },

                documents: {
                    total: documentsCount,
                },

                skills: {
                    total: skillsCount,
                },
            },
        });
    } catch (error) {
        console.error('getDashboard Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to load dashboard data.',
        });
    }
};