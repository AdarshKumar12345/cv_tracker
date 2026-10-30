import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import resumeRoutes from './routes/resumeRoutes';
import companyRoutes from './routes/companyRoutes';
import interviewRoutes from './routes/interviewRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import activityRoutes from './routes/activityRoutes';

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy for Render / Vercel
app.set('trust proxy', 1);

// Database Connection
connectDB();

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      // Explicit allowed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any Vercel deployment domain (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
      // In development allow all
      if (process.env.NODE_ENV !== 'production') return callback(null, true);

      return callback(null, true); // Fallback to allow connection
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve uploads statically if needed
const uploadPath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const server = app.listen(PORT, () => {
  console.log(`[Server] CV Tracker API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
export { server };
