import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl'; // Import sign instead of verify
import bs58 from 'bs58';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        walletAddress: string;
      };
    }
  }
}

/**
 * Middleware to verify Solana wallet signatures for authentication
 */
export const verifyWalletSignature = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, message, signature } = req.body;

    if (!walletAddress || !message || !signature) {
      return next(new Error('Wallet address, message, and signature are required'));
    }

    // Convert the signature from base58 string to Uint8Array
    const signatureUint8 = bs58.decode(signature);

    // Convert the message to Uint8Array
    const messageUint8 = new TextEncoder().encode(message);

    // Get the public key from the wallet address
    const publicKey = new PublicKey(walletAddress);

    // Verify the signature using tweetnacl's sign.detached.verify
    const isValid = sign.detached.verify(
      messageUint8,      // The message that was signed
      signatureUint8,    // The signature to verify
      publicKey.toBytes() // The public key to verify against
    );

    if (!isValid) {
      return next(new Error('Invalid signature'));
    }

    // Add user to request object for the next middleware/controller
    req.user = { walletAddress };

    // If valid, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    next(new Error('Signature verification failed'));
  }
};

/**
 * Middleware to verify JWT token for protected routes
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new Error('No token provided'));
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new Error('No token provided'));
    }
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Failed to authenticate token'));
      }

      // Add the decoded wallet address to the request object
      req.user = decoded as { walletAddress: string };
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    next(new Error('Token verification failed'));
  }
};
