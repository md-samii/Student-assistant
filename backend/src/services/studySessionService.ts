import prisma from '../config/prisma';

export const createStudySession = async (
    userId: string,
    startedAt: Date,
    endedAt: Date
) => {
    const durationMs = endedAt.getTime() - startedAt.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    if (durationMinutes <= 0) {
        throw new Error('Study session must be longer than 1 minute.');
    }

    return prisma.studySession.create({
        data: {
            userId,
            startedAt,
            endedAt,
            durationMinutes,
        },
    });
};

export const getTodayStudyTime = async (
    userId: string,
    startOfDay: Date,
    endOfDay: Date
) => {
    const sessions = await prisma.studySession.findMany({
        where: {
            userId,
            startedAt: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
        select: {
            durationMinutes: true,
        },
    });

    return sessions.reduce(
        (total, session) => total + session.durationMinutes,
        0
    );
};