import { Router } from 'express';
import {
  getProjects,
  addProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getProjects);
router.post('/', addProject);
router.delete('/:id', deleteProject);

export default router;
