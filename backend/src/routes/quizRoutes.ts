import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getSubmissionHistory,
  deleteQuiz,
  generatePracticeQuiz,
  submitPracticeQuiz,
  getPracticeStats,
} from '../controllers/quizController';
import { authenticateToken } from '../middlewares/auth';
import { generateQuiz } from '../controllers/quizGenerationController';

const router = Router();

router.use(authenticateToken);

// On-Demand AI Practice Quiz endpoints
router.post('/practice/generate', generatePracticeQuiz);
router.post('/practice/:attemptId/submit', submitPracticeQuiz);
router.get('/practice/stats', getPracticeStats);

// Submissions history
router.get('/submissions/history', getSubmissionHistory);

// Shared / Catalog Quizzes
router.get('/', getQuizzes);
router.post('/generate', generateQuiz);
router.delete('/:id', deleteQuiz);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);

export default router;
