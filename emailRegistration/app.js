import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import waitlistRouter from './waitlistRouter.js';
import ApiError from './ApiError.js';
import ApiResponse from './ApiResponse.js';

dotenv.config();

const app = express();

// Parse allowed origins from environment variable
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    return ['http://localhost:3000']; // Default fallback
  }
  return origins.split(',').map(origin => origin.trim());
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.) - they'll need API key
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS - Origin not in allowed list'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Key authentication middleware
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  // Skip API key check for requests from allowed origins (your frontend)
  if (origin && allowedOrigins.includes(origin)) {
    return next();
  }
  
  // Require API key for requests without origin or from non-allowed origins
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json(
      new ApiResponse(401, null, 'Unauthorized: Valid API key required for non-frontend access')
    );
  }
  
  next();
});

// Routes
app.use('/api/waitlist', waitlistRouter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, {
    timestamp: new Date().toISOString(),
    allowedOrigins: getAllowedOrigins()
  }, 'Server is healthy'));
});

// 404 handler - must be after all routes but before error handler
app.use((req, res, next) => {
  res.status(404).json(new ApiResponse(404, null, 'Route not found'));
});

// Global error handler
app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json(
      new ApiResponse(403, null, 'CORS Error: Origin not allowed')
    );
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(new ApiResponse(400, null, 'Validation Error', errors));
  }

  // Handle mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json(new ApiResponse(409, null, 'Email already exists'));
  }

  console.error('Unhandled error:', err);
  res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
});

export default app;