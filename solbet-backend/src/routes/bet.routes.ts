import { Router, type Request,type  Response,type NextFunction } from 'express';
import * as BetController from '../controllers/bet.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes with proper handler wrappers
router.get('/', (req: Request, res: Response) => {
  BetController.getAllBets(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
  BetController.getBetById(req, res);
});

router.get('/user/:walletAddress', (req: Request, res: Response) => {
  BetController.getBetsByCreator(req, res);
});

router.get('/participated/:walletAddress', (req: Request, res: Response) => {
  BetController.getBetsParticipated(req, res);
});

// Protected routes with proper middleware handling
router.post('/', 
  (req: Request, res: Response, next: NextFunction) => {
    verifyToken(req, res, (err?: any) => {
      if (err) return next(err);
      next();
    });
  },
  (req: Request, res: Response) => {
    BetController.createBet(req, res);
  }
);

router.put('/:id/resolve', 
  (req: Request, res: Response, next: NextFunction) => {
    verifyToken(req, res, (err?: any) => {
      if (err) return next(err);
      next();
    });
  },
  (req: Request, res: Response) => {
    BetController.resolveBet(req, res);
  }
);

export default router;
