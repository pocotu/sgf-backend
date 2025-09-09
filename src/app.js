require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// TODO: Import middleware
// const authMiddleware = require('./middleware/auth');
// const errorHandler = require('./middleware/errorHandler');
// const logger = require('./infrastructure/logging/logger');

// TODO: Import routes
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const classRoutes = require('./routes/classRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(API_PREFIX, limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    version: require('../package.json').version
  });
});

// API routes (TODO: Uncomment when routes are implemented)
// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/classes`, classRoutes);
// app.use(`${API_PREFIX}/bookings`, bookingRoutes);

// Welcome endpoint
app.get(API_PREFIX, (req, res) => {
  res.json({
    message: 'SGA-P Backend API - Sistema de Gestión Integral para Academias Preuniversitarias',
    version: require('../package.json').version,
    environment: process.env.NODE_ENV,
    health: `${req.protocol}://${req.get('host')}/health`
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      health: '/health',
      api: API_PREFIX
    }
  });
});

// Global error handler (TODO: Replace with proper error handling middleware)
app.use((err, req, res) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 SGA-P Backend ejecutándose en puerto ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  // eslint-disable-next-line no-console
  console.log(`🌐 URL Base API: http://localhost:${PORT}${API_PREFIX}`);
  // eslint-disable-next-line no-console
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
