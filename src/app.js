require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

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

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version,
  });
});

// Welcome endpoint
app.get(API_PREFIX, (req, res) => {
  res.json({
    message: 'SGA-P Backend API - Sistema de Gestion Integral para Academias Preuniversitarias',
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

const authController = container.resolve('authController');
const userController = container.resolve('userController');
const studentController = container.resolve('studentController');
const courseController = container.resolve('courseController');
const groupController = container.resolve('groupController');
const enrollmentController = container.resolve('enrollmentController');
const attendanceController = container.resolve('attendanceController');
const authService = container.resolve('authService');

app.use(`${API_PREFIX}/auth`, configureAuthRoutes(authController, authService));
app.use(`${API_PREFIX}/users`, configureUserRoutes(userController, authService));
app.use(`${API_PREFIX}/students`, configureStudentRoutes(studentController, authService));
app.use(`${API_PREFIX}/courses`, configureCourseRoutes(courseController, authService));
app.use(`${API_PREFIX}/groups`, configureGroupRoutes(groupController, authService));
app.use(`${API_PREFIX}/enrollments`, configureEnrollmentRoutes(enrollmentController, authService));
app.use(`${API_PREFIX}/attendances`, configureAttendanceRoutes(attendanceController, authService));

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler - debe ir antes del error handler
app.use(notFoundHandler);

// Global error handler - debe ser el último middleware
app.use(errorHandler);

// Export app (el servidor se inicia en src/server.js)
module.exports = app;
