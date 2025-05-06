import { Router, type Request, type Response, type NextFunction } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { verifyWalletSignature } from '../middleware/auth.middleware';

const router = Router();

// Get nonce for authentication
router.get('/nonce', (req: Request, res: Response) => {
  AuthController.getNonce(req, res);
});

// Login with wallet - using proper middleware chaining
// The middleware needs to pass control to the next handler instead of returning a response
router.post('/login', 
  // Use middleware in a way that matches its expected signature
  (req: Request, res: Response, next: NextFunction) => {
    verifyWalletSignature(req, res, (err?: any) => {
      if (err) return next(err);
      next();
    });
  },
  // Then handle the actual login
  (req: Request, res: Response) => {
    AuthController.login(req, res);
  }
);

// Development-only login route for testing purposes
router.post('/dev-login', (req: Request, res: Response) => {
  AuthController.devLogin(req, res);
});

export default router;
