import { Router } from 'express';
import { getRecommendedVideos, getVideoById } from '../controllers/videoController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getRecommendedVideos);
router.get('/:id', getVideoById);

export default router;
