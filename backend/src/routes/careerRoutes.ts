import { Router } from 'express';
import {
  getOpportunities,
  applyForOpportunity,
  getStudentProjects,
  addStudentProject,
} from '../controllers/careerController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/opportunities', getOpportunities);
router.post('/apply/:id', applyForOpportunity);
router.get('/projects', getStudentProjects);
router.post('/projects', addStudentProject);

export default router;
