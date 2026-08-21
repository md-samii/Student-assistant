import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth';
import {
  getAdminStats,
  getStudents,
  toggleStudentStatus,
  getAuditLogs,
  exportStudentsCSV,
  exportQuizzesCSV,
  getContentUsageReports,
} from '../controllers/adminController';

const router = Router();

// Protect all admin routes with JWT Auth + ADMIN role guard
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/students', getStudents);
router.patch('/students/:id/status', toggleStudentStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/export/students', exportStudentsCSV);
router.get('/export/quizzes', exportQuizzesCSV);
router.get('/reports/content-usage', getContentUsageReports);

export default router;
