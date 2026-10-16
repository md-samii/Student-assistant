import { Router } from 'express';
import {
    getWeeklyActivity,
    getYearlyActivity,
} from '../controllers/activityController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/weekly', getWeeklyActivity);
router.get('/yearly', getYearlyActivity);

export default router;