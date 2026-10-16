import prisma from '../config/prisma';

export const recordLearningActivity = async (
    userId: string,
    type: string
): Promise<void> => {
    try {
        await prisma.learningActivity.create({
            data: {
                userId,
                type,
            },
        });
    } catch (error) {
        console.error('Failed to record learning activity:', error);
    }
};
