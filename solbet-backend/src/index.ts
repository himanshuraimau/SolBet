import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

// Import routes
import authRoutes from './routes/auth.routes';
import betRoutes from './routes/bet.routes';
import userBetRoutes from './routes/userBet.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/user-bets', userBetRoutes);

// Basic route to test if the server is running
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'SolBet API is running',
    version: '1.0.0'
  });
});

// General error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB (if configured)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('MongoDB connection skipped (no URI provided)');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Start the server
const startServer = async () => {
  try {
    // Try to connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the API at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Run the server
startServer();
