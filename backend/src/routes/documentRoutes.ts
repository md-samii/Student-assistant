import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from '../controllers/documentController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDocuments);
router.post('/upload', uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
