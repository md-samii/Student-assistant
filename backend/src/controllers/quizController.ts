import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { DEFAULT_QUIZ_CATALOG, QuizSeedItem } from '../utils/quizSeed';
import { recordLearningActivity } from '../services/activityService';
import { generateQuizQuestionsOnly } from '../services/quizGenerationService';

// Fallback in-memory cache for backwards compatibility with test harness
const mockSubmissions = new Map<string, any[]>();

// In-memory active practice quiz sessions
interface StoredPracticeQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface StoredPracticeAttempt {
  attemptId: string;
  userId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  moduleNumber: number;
  questionCount: number;
  difficulty: string;
  totalMarks: number;
  timeLimitMin: number;
  createdAt: number;
  submitted: boolean;
  questions: StoredPracticeQuestion[];
}

const activePracticeAttempts = new Map<string, StoredPracticeAttempt>();

// Prune attempts older than 3 hours
const cleanupExpiredAttempts = () => {
  const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
  for (const [id, attempt] of activePracticeAttempts.entries()) {
    if (attempt.createdAt < threeHoursAgo) {
      activePracticeAttempts.delete(id);
    }
  }
};

/**
 * Fetch available quizzes (shared catalog)
 */
export const getQuizzes = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const { subject, moduleNumber } = req.query;

    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(subject
          ? {
            subject: {
              is: {
                OR: [
                  {
                    code: {
                      contains: String(subject),
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: String(subject),
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          }
          : {}),
        ...(moduleNumber && moduleNumber !== 'ALL'
          ? { moduleNumber: Number(moduleNumber) }
          : {}),
      },
      include: {
        subject: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        quizzes: quizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          subjectCode: quiz.subject.code,
          subjectName: quiz.subject.name,
          moduleNumber: quiz.moduleNumber,
          timeLimitMin: quiz.timeLimitMin,
          totalMarks: quiz.totalMarks,
          questionsCount: quiz._count.questions,
          creatorId: quiz.creatorId,
        })),
      },
    });
  } catch (error) {
    console.error('getQuizzes Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quizzes.',
    });
  }
};

/**
 * Fetch a quiz by ID (from database or default catalog) for taking a test
 */
export const getQuizById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check seed catalog first
    const catalogQuiz = DEFAULT_QUIZ_CATALOG.find((q) => q.id === id);

    if (catalogQuiz) {
      const clientQuiz = {
        id: catalogQuiz.id,
        title: catalogQuiz.title,
        description: catalogQuiz.description,
        subjectCode: catalogQuiz.subjectCode,
        subjectName: catalogQuiz.subjectName,
        moduleNumber: catalogQuiz.moduleNumber,
        timeLimitMin: catalogQuiz.timeLimitMin,
        totalMarks: catalogQuiz.totalMarks,
        difficulty: catalogQuiz.difficulty,
        questions: catalogQuiz.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
        })),
      };

      return res.status(200).json({
        status: 'success',
        data: { quiz: clientQuiz },
      });
    }

    // Check PostgreSQL database
    const dbQuiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: true,
      },
    });

    if (!dbQuiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    const clientQuiz = {
      id: dbQuiz.id,
      title: dbQuiz.title,
      description: dbQuiz.description,
      subjectCode: dbQuiz.subject.code,
      subjectName: dbQuiz.subject.name,
      moduleNumber: dbQuiz.moduleNumber,
      timeLimitMin: dbQuiz.timeLimitMin || Math.max(5, dbQuiz.questions.length),
      totalMarks: dbQuiz.totalMarks,
      difficulty: 'Intermediate',
      questions: dbQuiz.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })),
    };

    return res.status(200).json({
      status: 'success',
      data: { quiz: clientQuiz },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Submit answers for a shared or catalog quiz
 */
export const submitQuiz = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const { id } = req.params;
    const { answers } = req.body;

    let totalMarks = 0;
    let quizTitle = '';
    let subjectName = '';
    let subjectId: string | null = null;
    let moduleNumber: number | null = null;
    let questionsToGrade: {
      id: string;
      questionText: string;
      options: string[];
      correctOption: number;
      explanation?: string | null;
    }[] = [];

    const catalogQuiz = DEFAULT_QUIZ_CATALOG.find((q) => q.id === id);

    if (catalogQuiz) {
      totalMarks = catalogQuiz.totalMarks;
      quizTitle = catalogQuiz.title;
      subjectName = catalogQuiz.subjectName;
      moduleNumber = catalogQuiz.moduleNumber;
      questionsToGrade = catalogQuiz.questions;
    } else {
      const dbQuiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          subject: true,
          questions: true,
        },
      });

      if (!dbQuiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Quiz not found',
        });
      }

      totalMarks = dbQuiz.totalMarks;
      quizTitle = dbQuiz.title;
      subjectName = dbQuiz.subject.name;
      subjectId = dbQuiz.subjectId;
      moduleNumber = dbQuiz.moduleNumber;
      questionsToGrade = dbQuiz.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
      }));
    }

    let score = 0;

    const breakdown = questionsToGrade.map((q) => {
      const selectedOption = answers ? answers[q.id] : undefined;
      const isCorrect = selectedOption === q.correctOption;

      if (isCorrect) {
        score += 1;
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: selectedOption !== undefined ? selectedOption : -1,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    // Persist submission record in database if dbQuiz was targeted
    let persistedId = `sub_${Date.now()}`;
    if (!catalogQuiz) {
      const savedSubmission = await prisma.quizSubmission.create({
        data: {
          quizId: id,
          userId: req.user.userId,
          subjectId,
          moduleNumber,
          score,
          totalMarks,
          answers: JSON.stringify(answers || {}),
          isPractice: false,
        },
      });
      persistedId = savedSubmission.id;
    }

    const submissionResult = {
      submissionId: persistedId,
      quizId: id,
      quizTitle,
      subjectName,
      score,
      totalMarks,
      percentage,
      submittedAt: new Date().toISOString(),
      breakdown,
    };

    // Record learning activity
    await recordLearningActivity(req.user.userId, 'QUIZ');

    const existingUserSubs = mockSubmissions.get(req.user.userId) || [];
    existingUserSubs.unshift(submissionResult);
    mockSubmissions.set(req.user.userId, existingUserSubs);

    return res.status(200).json({
      status: 'success',
      message: `Quiz completed! Score: ${score}/${totalMarks} (${percentage}%)`,
      data: {
        result: submissionResult,
      },
    });
  } catch (error: any) {
    console.error('submitQuiz Error:', error);

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * Generate an On-Demand AI Practice Quiz (Temporary, not saved to permanent Quiz table)
 */
export const generatePracticeQuiz = async (
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

    cleanupExpiredAttempts();

    const {
      subjectCode,
      moduleNumber = 1,
      questionCount = 10,
      difficulty = 'Intermediate',
    } = req.body;

    if (typeof subjectCode !== 'string' || !subjectCode.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'subjectCode is required.',
      });
    }

    const parsedModule = Number(moduleNumber);
    if (!Number.isInteger(parsedModule) || parsedModule < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'moduleNumber must be a positive integer.',
      });
    }

    const parsedCount = Number(questionCount);
    if (![5, 10, 15, 20].includes(parsedCount)) {
      return res.status(400).json({
        status: 'error',
        message: 'questionCount must be 5, 10, 15, or 20.',
      });
    }

    const allowedDifficulties = ['Easy', 'Intermediate', 'Hard'];
    const chosenDifficulty = allowedDifficulties.includes(difficulty)
      ? difficulty
      : 'Intermediate';

    // Generate questions in memory using AI without persisting Quiz/QuizQuestion records
    const { subject, generated } = await generateQuizQuestionsOnly(
      subjectCode.trim(),
      parsedModule,
      parsedCount,
      chosenDifficulty
    );

    const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const formattedQuestions: StoredPracticeQuestion[] = generated.questions.map(
      (q, idx) => ({
        id: `pq_${idx + 1}`,
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctOption: q.correctOption,
        explanation: q.explanation.trim(),
      })
    );

    const timeLimitMin = Math.max(5, parsedCount);

    // Save attempt in server memory for the duration of the test
    activePracticeAttempts.set(attemptId, {
      attemptId,
      userId: req.user.userId,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      moduleNumber: parsedModule,
      questionCount: parsedCount,
      difficulty: chosenDifficulty,
      totalMarks: parsedCount,
      timeLimitMin,
      createdAt: Date.now(),
      submitted: false,
      questions: formattedQuestions,
    });

    // Sanitize response: NEVER send correctOption or explanation to browser before submission!
    return res.status(200).json({
      status: 'success',
      message: 'Practice quiz generated successfully.',
      data: {
        quiz: {
          attemptId,
          title: generated.title || `${subject.name} - Module ${parsedModule} Practice Quiz`,
          description: generated.description,
          subjectCode: subject.code,
          subjectName: subject.name,
          moduleNumber: parsedModule,
          timeLimitMin,
          totalMarks: parsedCount,
          difficulty: chosenDifficulty,
          isPractice: true,
          questions: formattedQuestions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error('generatePracticeQuiz Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate practice quiz.';
    const status = message.includes('not found')
      ? 404
      : message.includes('required') || message.includes('must be') || message.includes('between')
      ? 400
      : 500;
    return res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * Safely grade and persist summary for an On-Demand Practice Quiz attempt
 */
export const submitPracticeQuiz = async (
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

    const { attemptId } = req.params;
    const { answers = {}, timeTakenSec } = req.body;

    const attempt = activePracticeAttempts.get(attemptId);

    if (!attempt) {
      return res.status(404).json({
        status: 'error',
        message: 'Practice attempt not found or has expired. Please start a new practice quiz.',
      });
    }

    if (attempt.userId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: this practice attempt belongs to another student.',
      });
    }

    if (attempt.submitted) {
      return res.status(400).json({
        status: 'error',
        message: 'This practice attempt has already been submitted.',
      });
    }

    // Mark as submitted to prevent replay
    attempt.submitted = true;

    // Grade answers safely on the backend
    let score = 0;
    const breakdown = attempt.questions.map((q) => {
      const selectedOption = answers[q.id];
      const isCorrect = selectedOption === q.correctOption;

      if (isCorrect) {
        score += 1;
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: selectedOption !== undefined ? selectedOption : -1,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalMarks = attempt.totalMarks;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const parsedTimeTaken = Number(timeTakenSec);
    const timeTaken = Number.isFinite(parsedTimeTaken) && parsedTimeTaken >= 0
      ? Math.round(parsedTimeTaken)
      : Math.round((Date.now() - attempt.createdAt) / 1000);

    // Persist ONLY attempt summary in PostgreSQL (no permanent Quiz or QuizQuestion created)
    const submission = await prisma.quizSubmission.create({
      data: {
        userId: req.user.userId,
        subjectId: attempt.subjectId,
        moduleNumber: attempt.moduleNumber,
        score,
        totalMarks,
        answers: JSON.stringify(answers),
        timeTakenSec: timeTaken,
        isPractice: true,
      },
    });

    // Record one learning activity for the completed quiz
    await recordLearningActivity(req.user.userId, 'QUIZ');

    const result = {
      submissionId: submission.id,
      attemptId: attempt.attemptId,
      quizTitle: `${attempt.subjectName} - Module ${attempt.moduleNumber} Practice`,
      subjectName: attempt.subjectName,
      subjectCode: attempt.subjectCode,
      moduleNumber: attempt.moduleNumber,
      score,
      totalMarks,
      percentage,
      timeTakenSec: timeTaken,
      submittedAt: submission.submittedAt.toISOString(),
      breakdown,
    };

    return res.status(200).json({
      status: 'success',
      message: `Practice quiz completed! Score: ${score}/${totalMarks} (${percentage}%)`,
      data: { result },
    });
  } catch (error: any) {
    console.error('submitPracticeQuiz Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to submit practice quiz.',
    });
  }
};

/**
 * Get personal practice statistics and recent attempt history for authenticated student
 */
export const getPracticeStats = async (
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

    const userId = req.user.userId;

    const submissions = await prisma.quizSubmission.findMany({
      where: {
        userId,
      },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        quiz: {
          select: {
            title: true,
            moduleNumber: true,
            subject: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    const practiceSubmissions = submissions.filter((s) => s.isPractice);
    const totalPracticeAttempts = practiceSubmissions.length;
    const totalAllAttempts = submissions.length;

    let totalScoreSum = 0;
    let totalMarksSum = 0;
    let bestPercentage = 0;

    // Subject-wise performance tracking
    const subjectMap = new Map<
      string,
      {
        subjectCode: string;
        subjectName: string;
        attempts: number;
        totalScore: number;
        totalMarks: number;
        bestScore: number;
      }
    >();

    // Module-wise performance tracking
    const moduleMap = new Map<
      string,
      {
        subjectCode: string;
        subjectName: string;
        moduleNumber: number;
        attempts: number;
        totalScore: number;
        totalMarks: number;
      }
    >();

    for (const sub of submissions) {
      const pct = sub.totalMarks > 0 ? (sub.score / sub.totalMarks) * 100 : 0;
      if (pct > bestPercentage) {
        bestPercentage = Math.round(pct);
      }

      totalScoreSum += sub.score;
      totalMarksSum += sub.totalMarks;

      const code = sub.subject?.code || sub.quiz?.subject?.code || 'GEN';
      const name = sub.subject?.name || sub.quiz?.subject?.name || 'General';
      const mod = sub.moduleNumber ?? sub.quiz?.moduleNumber ?? 1;

      // Update subject map
      const existingSubj = subjectMap.get(code) || {
        subjectCode: code,
        subjectName: name,
        attempts: 0,
        totalScore: 0,
        totalMarks: 0,
        bestScore: 0,
      };
      existingSubj.attempts += 1;
      existingSubj.totalScore += sub.score;
      existingSubj.totalMarks += sub.totalMarks;
      if (pct > existingSubj.bestScore) existingSubj.bestScore = Math.round(pct);
      subjectMap.set(code, existingSubj);

      // Update module map
      const modKey = `${code}_M${mod}`;
      const existingMod = moduleMap.get(modKey) || {
        subjectCode: code,
        subjectName: name,
        moduleNumber: mod,
        attempts: 0,
        totalScore: 0,
        totalMarks: 0,
      };
      existingMod.attempts += 1;
      existingMod.totalScore += sub.score;
      existingMod.totalMarks += sub.totalMarks;
      moduleMap.set(modKey, existingMod);
    }

    const averageAccuracy =
      totalMarksSum > 0 ? Math.round((totalScoreSum / totalMarksSum) * 100) : 0;

    const subjectWise = Array.from(subjectMap.values()).map((s) => ({
      ...s,
      averagePercentage:
        s.totalMarks > 0 ? Math.round((s.totalScore / s.totalMarks) * 100) : 0,
    }));

    const moduleWise = Array.from(moduleMap.values()).map((m) => ({
      ...m,
      averagePercentage:
        m.totalMarks > 0 ? Math.round((m.totalScore / m.totalMarks) * 100) : 0,
    }));

    const recentHistory = submissions.slice(0, 15).map((s) => {
      const pct = s.totalMarks > 0 ? Math.round((s.score / s.totalMarks) * 100) : 0;
      return {
        id: s.id,
        title: s.isPractice
          ? `${s.subject?.name || 'Subject'} - Module ${s.moduleNumber || 1} Practice`
          : s.quiz?.title || 'Shared Quiz',
        subjectCode: s.subject?.code || s.quiz?.subject?.code || '',
        subjectName: s.subject?.name || s.quiz?.subject?.name || '',
        moduleNumber: s.moduleNumber ?? s.quiz?.moduleNumber ?? null,
        score: s.score,
        totalMarks: s.totalMarks,
        percentage: pct,
        timeTakenSec: s.timeTakenSec || null,
        isPractice: s.isPractice,
        submittedAt: s.submittedAt.toISOString(),
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalPracticeAttempts,
          totalAllAttempts,
          averageScore: averageAccuracy,
          bestScore: bestPercentage,
          subjectWise,
          moduleWise,
          recentHistory,
        },
      },
    });
  } catch (error: any) {
    console.error('getPracticeStats Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch practice statistics.',
    });
  }
};

/**
 * Get submission history (compatible with existing route)
 */
export const getSubmissionHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const submissions = await prisma.quizSubmission.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        subject: true,
        quiz: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    const formatted = submissions.map((s) => ({
      submissionId: s.id,
      quizId: s.quizId || s.id,
      quizTitle: s.isPractice
        ? `${s.subject?.name || 'Subject'} - Module ${s.moduleNumber || 1} Practice`
        : s.quiz?.title || 'Quiz',
      subjectName: s.subject?.name || s.quiz?.subject?.name || '',
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.totalMarks > 0 ? Math.round((s.score / s.totalMarks) * 100) : 0,
      submittedAt: s.submittedAt.toISOString(),
      isPractice: s.isPractice,
      timeTakenSec: s.timeTakenSec,
    }));

    return res.status(200).json({
      status: 'success',
      data: { submissions: formatted },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Delete a quiz created by the student
 */
export const deleteQuiz = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found',
      });
    }

    if (!quiz.creatorId) {
      return res.status(403).json({
        status: 'error',
        message: 'This quiz has no assigned owner and cannot be deleted.',
      });
    }

    if (quiz.creatorId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can delete only quizzes you created.',
      });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Quiz deleted successfully.',
      data: { id },
    });
  } catch (error) {
    console.error('deleteQuiz Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete quiz.',
    });
  }
};
