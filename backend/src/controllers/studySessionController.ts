import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';
import { recordLearningActivity } from '../services/learningActivityService';
import {
    createStudySession,
    getTodayStudyTime,
} from '../services/studySessionService';


export const startStudySession = async (
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

        const existingSession = await prisma.activeStudySession.findUnique({
            where: {
                userId: req.user.userId,
            },
        });

        if (existingSession) {
            res.status(409).json({
                status: 'error',
                message: 'A study session is already active.',
                data: {
                    startedAt: existingSession.startedAt.toISOString(),
                },
            });
            return;
        }

        const session = await prisma.activeStudySession.create({
            data: {
                userId: req.user.userId,
                startedAt: new Date(),
            },
        });

        res.status(201).json({
            status: 'success',
            message: 'Study session started.',
            data: {
                startedAt: session.startedAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('startStudySession Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to start study session.',
        });
    }
};

export const endStudySession = async (
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

        const activeSession = await prisma.activeStudySession.findUnique({
            where: {
                userId: req.user.userId,
            },
        });

        if (!activeSession) {
            res.status(404).json({
                status: 'error',
                message: 'No active study session found.',
            });
            return;
        }

        const endTime = new Date();

        const session = await createStudySession(
            req.user.userId,
            activeSession.startedAt,
            endTime
        );

        await prisma.activeStudySession.delete({
            where: {
                userId: req.user.userId,
            },
        });

        await recordLearningActivity(
            req.user.userId,
            'STUDY_SESSION'
        );

        res.status(201).json({
            status: 'success',
            message: 'Study session completed.',
            data: session,
        });
    } catch (error) {
        console.error('endStudySession Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to save study session.',
        });
    }
};

export const getTodayStudySummary = async (
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

        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const totalMinutes = await getTodayStudyTime(
            req.user.userId,
            startOfDay,
            endOfDay
        );

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
            select: {
                dailyStudyGoalMinutes: true,
            },
        });

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found.',
            });
            return;
        }

        const dailyGoalMinutes = user.dailyStudyGoalMinutes;

        const progress = Math.min(
            Math.round((totalMinutes / dailyGoalMinutes) * 100),
            100
        );

        res.status(200).json({
            status: 'success',
            data: {
                totalMinutes,
                dailyGoalMinutes,
                progress,
            },
        });
    } catch (error) {
        console.error('getTodayStudySummary Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to load study summary.',
        });
    }
};

export const updateDailyStudyGoal = async (
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

        const { dailyGoalMinutes } = req.body;

        if (
            typeof dailyGoalMinutes !== 'number' ||
            !Number.isInteger(dailyGoalMinutes) ||
            dailyGoalMinutes < 15 ||
            dailyGoalMinutes > 1440
        ) {
            res.status(400).json({
                status: 'error',
                message: 'Daily study goal must be between 15 and 1440 minutes.',
            });
            return;
        }

        const user = await prisma.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                dailyStudyGoalMinutes: dailyGoalMinutes,
            },
            select: {
                dailyStudyGoalMinutes: true,
            },
        });

        res.status(200).json({
            status: 'success',
            message: 'Daily study goal updated successfully.',
            data: user,
        });
    } catch (error) {
        console.error('updateDailyStudyGoal Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to update daily study goal.',
        });
    }
};



export const getActiveStudySession = async (
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

        const session = await prisma.activeStudySession.findUnique({
            where: {
                userId: req.user.userId,
            },
            select: {
                id: true,
                startedAt: true,
            },
        });

        res.status(200).json({
            status: 'success',
            data: {
                active: Boolean(session),
                session: session
                    ? {
                        id: session.id,
                        startedAt: session.startedAt.toISOString(),
                    }
                    : null,
            },
        });
    } catch (error) {
        console.error('getActiveStudySession Error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to load active study session.',
        });
    }
};