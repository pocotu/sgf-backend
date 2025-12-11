require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Trust proxy - Required for Render and other reverse proxies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Log application startup
logger.info('Starting Lumen Backend API', {
  environment: process.env.NODE_ENV,
  nodeVersion: process.version,
  platform: process.platform,
});

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? corsOrigin.split(',').map(origin => origin.trim())
    : corsOrigin.split(',').map(origin => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use(API_PREFIX, limiter);

// Body parsing middleware
const bodyLimit = process.env.BODY_LIMIT || '10mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Request logging middleware (Winston)
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Morgan for development (console output)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic health check endpoint (for load balancers)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Welcome endpoint
app.get(API_PREFIX, (req, res) => {
  res.json({
    message: 'Lumen Backend API - Sistema de Gestion Integral para Academias Preuniversitarias',
    version: require('../package.json').version,
    environment: process.env.NODE_ENV,
    health: `${req.protocol}://${req.get('host')}/health`,
  });
});

// Configure dependencies
const { configureDependencies, container } = require('./config/dependencies');
configureDependencies();

// Configure routes
const configureAuthRoutes = require('./routes/auth.routes');
const configureUserRoutes = require('./routes/user.routes');
const configureStudentRoutes = require('./routes/student.routes');
const configureCourseRoutes = require('./routes/course.routes');
const configureGroupRoutes = require('./routes/group.routes');
const configureEnrollmentRoutes = require('./routes/enrollment.routes');
const configureAttendanceRoutes = require('./routes/attendance.routes');
const configureEvaluationRoutes = require('./routes/evaluation.routes');
const configureGradeRoutes = require('./routes/grade.routes');
const configureRankingRoutes = require('./routes/ranking.routes');
const configureHealthRoutes = require('./routes/health.routes');

const authController = container.resolve('authController');
const userController = container.resolve('userController');
const studentController = container.resolve('studentController');
const courseController = container.resolve('courseController');
const groupController = container.resolve('groupController');
const enrollmentController = container.resolve('enrollmentController');
const attendanceController = container.resolve('attendanceController');
const evaluationController = container.resolve('evaluationController');
const gradeController = container.resolve('gradeController');
const rankingController = container.resolve('rankingController');
const healthController = container.resolve('healthController');
const authService = container.resolve('authService');

// Health check routes (no authentication required)
app.use(`${API_PREFIX}/health`, configureHealthRoutes(healthController));

// Application routes (with authentication)
app.use(`${API_PREFIX}/auth`, configureAuthRoutes(authController, authService));
app.use(`${API_PREFIX}/users`, configureUserRoutes(userController, authService));
app.use(`${API_PREFIX}/students`, configureStudentRoutes(studentController, authService));
app.use(`${API_PREFIX}/courses`, configureCourseRoutes(courseController, authService));
app.use(`${API_PREFIX}/groups`, configureGroupRoutes(groupController, authService));
app.use(`${API_PREFIX}/enrollments`, configureEnrollmentRoutes(enrollmentController, authService));
app.use(`${API_PREFIX}/attendances`, configureAttendanceRoutes(attendanceController, authService));
app.use(`${API_PREFIX}/evaluations`, configureEvaluationRoutes(evaluationController, authService));
app.use(`${API_PREFIX}/grades`, configureGradeRoutes(gradeController, authService));
app.use(`${API_PREFIX}/rankings`, configureRankingRoutes(rankingController, authService));

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler - debe ir antes del error handler
app.use(notFoundHandler);

// Global error handler - debe ser el último middleware
app.use(errorHandler);

// Export app (el servidor se inicia en src/server.js)
module.exports = app;
