import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { generateAcademicAIResponse } from '../services/aiService';

// In-memory fallback history store if SQLite table is initializing
const mockHistory = new Map<string, any[]>();

export const askAI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { question, subject, mode = 'THEORY' } = req.body;

    if (!question) {
      return res.status(400).json({ status: 'error', message: 'Question is required.' });
    }

    let university = 'Visvesvaraya Technological University (VTU)';
    let branch = 'Computer Science & Engineering';
    let semester = 5;

    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (profile) {
        university = profile.university;
        branch = profile.branch;
        semester = profile.semester;
      }
    } catch (e) {}

    const aiPayload = await generateAcademicAIResponse(question, {
      university,
      branch,
      semester,
      subject,
      mode,
    });

    const stringifiedAnswer = JSON.stringify(aiPayload);
    let historyEntry: any = null;

    try {
      historyEntry = await prisma.chatHistory.create({
        data: {
          userId: req.user.userId,
          question,
          subject: subject || 'Computer Science Core',
          answer: stringifiedAnswer,
          isBookmarked: false,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma chatHistory write bypassed, using memory store:', dbErr);
      historyEntry = {
        id: `chat_${Date.now()}`,
        userId: req.user.userId,
        question,
        subject: subject || 'Computer Science Core',
        answer: stringifiedAnswer,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      };

      const userHist = mockHistory.get(req.user.userId) || [];
      userHist.unshift(historyEntry);
      mockHistory.set(req.user.userId, userHist);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: historyEntry.id,
        question,
        subject: subject || 'Computer Science Core',
        aiResponse: aiPayload,
        isBookmarked: historyEntry.isBookmarked,
        createdAt: historyEntry.createdAt,
      },
    });
  } catch (error: any) {
    console.error('askAI Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    let history: any[] = [];
    try {
      const dbHistory = await prisma.chatHistory.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      history = dbHistory.map((item) => {
        let parsedAnswer: any = {};
        try {
          parsedAnswer = JSON.parse(item.answer);
        } catch (e) {
          parsedAnswer = { explanation: item.answer };
        }
        return {
          id: item.id,
          question: item.question,
          subject: item.subject,
          aiResponse: parsedAnswer,
          isBookmarked: item.isBookmarked,
          createdAt: item.createdAt,
        };
      });
    } catch (e) {
      const memHistory = mockHistory.get(req.user.userId) || [];
      history = memHistory.map((item) => {
        let parsedAnswer: any = {};
        try {
          parsedAnswer = JSON.parse(item.answer);
        } catch (err) {
          parsedAnswer = { explanation: item.answer };
        }
        return {
          id: item.id,
          question: item.question,
          subject: item.subject,
          aiResponse: parsedAnswer,
          isBookmarked: item.isBookmarked,
          createdAt: item.createdAt,
        };
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { history },
    });
  } catch (error: any) {
    console.error('getHistory Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleBookmark = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { id } = req.params;

    try {
      const item = await prisma.chatHistory.findUnique({ where: { id } });
      if (item) {
        const updated = await prisma.chatHistory.update({
          where: { id },
          data: { isBookmarked: !item.isBookmarked },
        });
        return res.status(200).json({
          status: 'success',
          data: { isBookmarked: updated.isBookmarked },
        });
      }
    } catch (e) {}

    const userHist = mockHistory.get(req.user.userId) || [];
    const target = userHist.find((h) => h.id === id);
    if (target) {
      target.isBookmarked = !target.isBookmarked;
      return res.status(200).json({
        status: 'success',
        data: { isBookmarked: target.isBookmarked },
      });
    }

    return res.status(200).json({ status: 'success', data: { isBookmarked: true } });
  } catch (error: any) {
    console.error('toggleBookmark Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteHistoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { id } = req.params;

    try {
      await prisma.chatHistory.delete({ where: { id } });
    } catch (e) {
      const userHist = mockHistory.get(req.user.userId) || [];
      const filtered = userHist.filter((h) => h.id !== id);
      mockHistory.set(req.user.userId, filtered);
    }

    return res.status(200).json({ status: 'success', message: 'History item deleted.' });
  } catch (error: any) {
    console.error('deleteHistoryItem Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
