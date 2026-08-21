import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import aiRoutes from './routes/aiRoutes';
import resourceRoutes from './routes/resourceRoutes';
import videoRoutes from './routes/videoRoutes';
import quizRoutes from './routes/quizRoutes';
import documentRoutes from './routes/documentRoutes';
import careerRoutes from './routes/careerRoutes';
import adminRoutes from './routes/adminRoutes';
import skillRoutes from './routes/skillRoutes';
import projectRoutes from './routes/projectRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config({ path: '../.env' });
if (!process.env.PORT) {
  dotenv.config({ path: './.env' });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Student Assistant API Server is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// OpenAPI / Swagger Documentation Spec Endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.status(200).json({
    openapi: '3.0.0',
    info: {
      title: 'AI Student Assistant Platform API Reference',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for authentication, academic study notes, AI tutoring, quizzes, document locker, career portals, and admin management.',
    },
    paths: {
      '/api/auth/register': { post: { summary: 'Register student account' } },
      '/api/auth/login': { post: { summary: 'Authenticate user & issue JWT token' } },
      '/api/ai/ask': { post: { summary: 'Query context-aware OpenAI academic assistant' } },
      '/api/resources': { get: { summary: 'List Google Drive study materials & notes' } },
      '/api/quizzes': { get: { summary: 'List practice quizzes by subject & module' } },
      '/api/careers/internships': { get: { summary: 'List active internship opportunities' } },
      '/api/admin/stats': { get: { summary: 'Administrator dashboard aggregated metrics' } },
    },
  });
});

// API Root Route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'AI Student Assistant Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      ai: '/api/ai',
      resources: '/api/resources',
      videos: '/api/videos',
      quizzes: '/api/quizzes',
      documents: '/api/documents',
      careers: '/api/careers',
      skills: '/api/skills',
      projects: '/api/projects',
      notifications: '/api/notifications',
      docs: '/api/docs',
      health: '/api/health',
    },
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:5000/api/health`);
  console.log(`=================================`);
});

export default app;
