import { Router } from 'express';
import {
  askAI,
  getHistory,
  toggleBookmark,
  deleteHistoryItem,
} from '../controllers/aiController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.post('/chat', askAI);
router.get('/history', getHistory);
router.post('/bookmark/:id', toggleBookmark);
router.delete('/history/:id', deleteHistoryItem);

export default router;
