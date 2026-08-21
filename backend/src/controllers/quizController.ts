import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { DEFAULT_QUIZ_CATALOG, QuizSeedItem } from '../utils/quizSeed';

const mockSubmissions = new Map<string, any[]>();

export const getQuizzes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { subject, moduleNumber } = req.query;
    let list = DEFAULT_QUIZ_CATALOG;

    if (subject) {
      const s = String(subject).toLowerCase();
      list = list.filter(
        (q) => q.subjectName.toLowerCase().includes(s) || q.subjectCode.toLowerCase().includes(s)
      );
    }

    if (moduleNumber && moduleNumber !== 'ALL') {
      const mod = parseInt(String(moduleNumber), 10);
      if (!isNaN(mod)) {
        list = list.filter((q) => q.moduleNumber === mod);
      }
    }

    // Strip correct options from question list in catalog summary
    const sanitizedQuizzes = list.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subjectCode: quiz.subjectCode,
      subjectName: quiz.subjectName,
      moduleNumber: quiz.moduleNumber,
      timeLimitMin: quiz.timeLimitMin,
      totalMarks: quiz.totalMarks,
      difficulty: quiz.difficulty,
      questionsCount: quiz.questions.length,
    }));

    return res.status(200).json({
      status: 'success',
      data: { quizzes: sanitizedQuizzes },
    });
  } catch (error: any) {
    console.error('getQuizzes Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getQuizById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const quiz = DEFAULT_QUIZ_CATALOG.find((q) => q.id === id);

    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    // Return questions without correct answers for test taking
    const clientQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subjectCode: quiz.subjectCode,
      subjectName: quiz.subjectName,
      moduleNumber: quiz.moduleNumber,
      timeLimitMin: quiz.timeLimitMin,
      totalMarks: quiz.totalMarks,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
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

export const submitQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { id } = req.params;
    const { answers } = req.body; // Object mapping questionId -> selectedOption (0-indexed number)

    const quiz = DEFAULT_QUIZ_CATALOG.find((q) => q.id === id);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    let score = 0;
    const breakdown = quiz.questions.map((q) => {
      const selectedOption = answers ? answers[q.id] : undefined;
      const isCorrect = selectedOption === q.correctOption;
      if (isCorrect) score += 1;

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

    const percentage = Math.round((score / quiz.totalMarks) * 100);

    const submissionResult = {
      submissionId: `sub_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      subjectName: quiz.subjectName,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      submittedAt: new Date().toISOString(),
      breakdown,
    };

    const existingUserSubs = mockSubmissions.get(req.user.userId) || [];
    existingUserSubs.unshift(submissionResult);
    mockSubmissions.set(req.user.userId, existingUserSubs);

    return res.status(200).json({
      status: 'success',
      message: `Quiz completed! Score: ${score}/${quiz.totalMarks} (${percentage}%)`,
      data: { result: submissionResult },
    });
  } catch (error: any) {
    console.error('submitQuiz Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getSubmissionHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const history = mockSubmissions.get(req.user.userId) || [];
    return res.status(200).json({
      status: 'success',
      data: { submissions: history },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
