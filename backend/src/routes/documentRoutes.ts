import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  viewDocument,
  downloadDocument,
} from '../controllers/documentController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDocuments);
router.post('/', uploadDocument);
router.post('/upload', uploadDocument);
router.get('/:id/view', viewDocument);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

export default router;
