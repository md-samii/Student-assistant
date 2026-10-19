
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { generateQuizFromNotes } from '../services/quizGenerationService';

export const generateQuiz = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authenticated.',
            });
        }

        const {
            subjectCode,
            moduleNumber,
            questionCount = 10,
            difficulty = 'Intermediate',
        } = req.body;

        if (typeof subjectCode !== 'string' || !subjectCode.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'subjectCode is required.',
            });
        }

        const quiz = await generateQuizFromNotes(
            req.user.userId,
            subjectCode.trim(),
            Number(moduleNumber),
            Number(questionCount),
            difficulty
        );

        return res.status(201).json({
            status: 'success',
            message: 'Quiz generated and saved successfully.',
            data: { quiz },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to generate quiz.';

        console.error('generateQuiz Error:', error);

        const status = message.includes('not found') ? 404
            : message.includes('required') ||
                message.includes('must be') ||
                message.includes('between') ? 400
                : message.includes('No indexed PDF notes') ? 422
                    : 500;

        return res.status(status).json({
            status: 'error',
            message,
        });
    }
};
