import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  upgradeSemester,
  getPersonalizedSubjects,
  exportUserData,
} from '../controllers/profileController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All profile endpoints require authentication
router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upgrade-semester', upgradeSemester);
router.get('/subjects', getPersonalizedSubjects);
router.get('/export-data', exportUserData);

export default router;
