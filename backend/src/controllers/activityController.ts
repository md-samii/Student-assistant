import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

export const getWeeklyActivity = async (
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

        // Start of today
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Start of the 7-day period
        const startDate = new Date(today);
        startDate.setUTCDate(startDate.getUTCDate() - 6);

        // Get all activities from the last 7 days
        const activities = await prisma.learningActivity.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Create a count for each day
        const dailyCounts = new Map<string, number>();

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setUTCDate(date.getUTCDate() + i);

            const dateKey = date.toISOString().split('T')[0];

            dailyCounts.set(dateKey, 0);
        }

        // Count activities for each day
        for (const activity of activities) {
            const dateKey = activity.createdAt
                .toISOString()
                .split('T')[0];

            if (dailyCounts.has(dateKey)) {
                dailyCounts.set(
                    dateKey,
                    (dailyCounts.get(dateKey) || 0) + 1
                );
            }
        }

        const weeklyActivity = Array.from(dailyCounts.entries()).map(
            ([date, count]) => ({
                date,
                count,
            })
        );

        // Total activities during the week
        const totalThisWeek = weeklyActivity.reduce(
            (total, day) => total + day.count,
            0
        );

        // Calculate current streak
        let currentStreak = 0;

        for (let i = weeklyActivity.length - 1; i >= 0; i--) {
            if (weeklyActivity[i].count > 0) {
                currentStreak++;
            } else {
                break;
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                weeklyActivity,
                currentStreak,
                totalThisWeek,
            },
        });
    } catch (error) {
        console.error('getWeeklyActivity Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to load weekly learning activity.',
        });
    }
};


export const getYearlyActivity = async (
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

        /*
         * Use the current calendar year.
         *
         * Example:
         * January 1, 2026 → December 31, 2026
         */
        const now = new Date();

        const year = now.getUTCFullYear();

        const startDate = new Date(
            Date.UTC(year, 0, 1, 0, 0, 0, 0)
        );

        const endDate = new Date(
            Date.UTC(year, 11, 31, 23, 59, 59, 999)
        );

        /*
         * Get all learning activities for this user
         * during the current calendar year.
         */
        const activities =
            await prisma.learningActivity.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });

        /*
         * Create an entry for every day of the year.
         *
         * Days without activity receive count = 0.
         */
        const dailyCounts = new Map<string, number>();

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateKey = currentDate
                .toISOString()
                .split('T')[0];

            dailyCounts.set(dateKey, 0);

            currentDate.setUTCDate(
                currentDate.getUTCDate() + 1
            );
        }

        /*
         * Count activities per day.
         */
        for (const activity of activities) {
            const dateKey = activity.createdAt
                .toISOString()
                .split('T')[0];

            if (dailyCounts.has(dateKey)) {
                dailyCounts.set(
                    dateKey,
                    (dailyCounts.get(dateKey) || 0) + 1
                );
            }
        }

        const activity = Array.from(
            dailyCounts.entries()
        ).map(([date, count]) => ({
            date,
            count,
        }));

        /*
         * Total number of learning activities.
         */
        const totalActivities = activity.reduce(
            (total, day) => total + day.count,
            0
        );

        /*
         * Number of days with at least one activity.
         */
        const activeDays = activity.filter(
            (day) => day.count > 0
        ).length;

        /*
         * Calculate maximum consecutive active days.
         */
        let currentStreak = 0;
        let maxStreak = 0;

        for (const day of activity) {
            if (day.count > 0) {
                currentStreak++;

                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        }

        /*
         * Calculate current streak.
         *
         * Start from today and move backwards.
         */
        let todayStreak = 0;

        for (let i = activity.length - 1; i >= 0; i--) {
            if (activity[i].count > 0) {
                todayStreak++;
            } else {
                break;
            }
        }

        res.status(200).json({
            status: 'success',

            data: {
                year,

                activity,

                totalActivities,

                activeDays,

                currentStreak: todayStreak,

                maxStreak,
            },
        });
    } catch (error) {
        console.error(
            'getYearlyActivity Error:',
            error
        );

        res.status(500).json({
            status: 'error',
            message:
                'Failed to load yearly learning activity.',
        });
    }
};