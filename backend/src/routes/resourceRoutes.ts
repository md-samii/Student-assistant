import { Router } from 'express';
import {
  getResources,
  createResource,
  getResourceById,
} from '../controllers/resourceController';
import { authenticateToken } from '../middlewares/auth';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', cacheMiddleware(900), getResources);
router.post('/', createResource);
router.get('/:id', cacheMiddleware(900), getResourceById);

export default router;
