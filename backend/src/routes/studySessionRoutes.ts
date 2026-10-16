import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
    startStudySession,
    endStudySession,
    getTodayStudySummary,
    updateDailyStudyGoal,
    getActiveStudySession,
} from '../controllers/studySessionController';

const router = Router();

router.use(authenticateToken);

router.post('/start', startStudySession);
router.post('/end', endStudySession);
router.get('/today', getTodayStudySummary);
router.patch('/goal', updateDailyStudyGoal);
router.get('/active', getActiveStudySession);

export default router;