import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model';

// In-memory store for nonces (should use Redis in production)
const nonceStore: { [key: string]: { nonce: string, expiresAt: number } } = {};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Generate a nonce for wallet authentication
 */
export const getNonce = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    // Generate a random nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    
    // Store nonce with 5-minute expiry
    nonceStore[walletAddress as string] = {
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    return res.status(200).json({
      message: 'Please sign this nonce to authenticate',
      nonce,
      walletAddress
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return res.status(500).json({ message: 'Error generating authentication nonce' });
  }
};

/**
 * Login with wallet (verify signature and issue JWT)
 */
export const login = async (req: Request, res: Response) => {
  try {
    // The signature has been verified by the middleware
    const { walletAddress } = req.user!;
    
    // Find or create the user
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = await User.create({ walletAddress });
    }
    
    // Use require instead of import for jwt to avoid TypeScript issues
    const jsonwebtoken = require('jsonwebtoken');
    
    // Generate JWT without TypeScript type checking
    const token = jsonwebtoken.sign(
      { walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error during login process' });
  }
};

/**
 * Development-only login that bypasses signature verification
 * This should only be used for testing purposes
 */
export const devLogin = async (req: Request, res: Response) => {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'This endpoint is only available in development mode' });
  }
  
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    // Find or create a user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = await User.create({ walletAddress });
    }
    
    // Generate a JWT token
    const token = jwt.sign(
      { walletAddress: user.walletAddress },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );
    
    console.warn('WARNING: Using development login route. This bypasses signature verification.');
    
    res.status(200).json({
      message: 'Development authentication successful',
      token,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};
