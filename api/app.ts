/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import meetingsRoutes from './routes/meetings.js';
import tasksRoutes from './routes/tasks.js';
import messagesRoutes from './routes/messages.js';
import errorsRoutes from './routes/errors.js';
import healthRoutes from './routes/health.js';
import cronRoutes from './routes/cron.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

const app: express.Application = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/errors', errorsRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api', healthRoutes);

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;
