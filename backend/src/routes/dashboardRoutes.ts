import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDashboard);

export default router;