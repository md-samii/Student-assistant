import { Router } from 'express';
import {
  getOpportunities,
  applyForOpportunity,
  syncOpportunities,
  getSyncStatus,
  analyzeResumeController,
  getLatestResumeAnalysis,
  getResumeHistory,
  downloadResumeReport,
  compareResumeWithJobController,
  getStudentProjects,
  addStudentProject,
} from '../controllers/careerController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

// Opportunities & Applications
router.get('/opportunities', getOpportunities);
router.post('/apply/:id', applyForOpportunity);

// Daily Synchronization
router.post('/sync', syncOpportunities);
router.get('/sync/status', getSyncStatus);

// Resume Analyzer
router.post('/resume/analyze', analyzeResumeController);
router.get('/resume/latest', getLatestResumeAnalysis);
router.get('/resume/history', getResumeHistory);
router.get('/resume/report/download', downloadResumeReport);
router.post('/resume/compare-job', compareResumeWithJobController);

// Student Portfolio Projects
router.get('/projects', getStudentProjects);
router.post('/projects', addStudentProject);

export default router;
