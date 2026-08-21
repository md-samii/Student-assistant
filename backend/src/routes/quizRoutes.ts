import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getSubmissionHistory,
} from '../controllers/quizController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getQuizzes);
router.get('/submissions/history', getSubmissionHistory);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);

export default router;
