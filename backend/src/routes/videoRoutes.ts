import { Router } from 'express';
import {
  getRecommendedVideos,
  getSubjectModules,
  getUserLibrary,
  toggleFavorite,
  updateVideoProgress,
  getVideoById,
  clearVideoHistory,
  removeHistoryItem,
} from '../controllers/videoController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

// Curriculum modules lookup
router.get('/curriculum/modules', getSubjectModules);

// User library: favorites and learning progress
router.get('/user/library', getUserLibrary);
router.post('/user/favorite', toggleFavorite);
router.post('/user/progress', updateVideoProgress);
router.delete('/user/history', clearVideoHistory);
router.delete('/user/history/:videoId', removeHistoryItem);

// Video recommendations & detail
router.get('/', getRecommendedVideos);
router.get('/:id', getVideoById);

export default router;
