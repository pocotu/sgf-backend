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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      health: '/health',
      api: API_PREFIX,
    },
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Export app (el servidor se inicia en src/server.js)
module.exports = app;
