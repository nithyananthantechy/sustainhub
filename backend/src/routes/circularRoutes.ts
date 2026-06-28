import { Router } from 'express';
import { getCircularStats } from '../controllers/circularController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticateToken);
router.get('/', getCircularStats);

export default router;
