import { Router } from 'express';
import {
  getResources,
  createResource,
  getResourceById,
} from '../controllers/resourceController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All resource endpoints require authentication.
router.use(authenticateToken);

// List resources with optional filters.
router.get('/', getResources);

// Create a resource (the controller enforces admin-only access).
router.post('/', createResource);

// Get a resource by ID.
router.get('/:id', getResourceById);

export default router;
