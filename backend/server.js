import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
const result = dotenv.config({ path: path.join(__dirname, envFile) });

if (result.error) {
  console.error(`Error loading ${envFile} file:`, result.error);
  process.exit(1);
}

// Log environment variables (without exposing sensitive values)
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URL:', process.env.MONGODB_URL ? 'Set' : 'Not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Railway provides the connection string in MONGODB_URL
    const mongoURI = process.env.MONGODB_URL || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB connection string not found. Set MONGODB_URL environment variable');
    }
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  }
};

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://taskmanagement-76ga.vercel.app',
      'https://taskmanagement-76ga-ragunath041.vercel.app',
      'https://taskmanagement-d0vh2lydz-ragunath-gs-projects-5f23d998.vercel.app'  // New Vercel preview URL
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      status: 404
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
