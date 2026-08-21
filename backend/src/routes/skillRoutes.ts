import { Router } from 'express';
import {
  getSkills,
  addSkill,
  deleteSkill,
  analyzeSkillGap,
} from '../controllers/skillController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getSkills);
router.post('/', addSkill);
router.delete('/:id', deleteSkill);
router.post('/analyze-gap', analyzeSkillGap);

export default router;
