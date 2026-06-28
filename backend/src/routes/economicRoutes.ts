import { Router } from 'express';
import { getEconomicImpact } from '../controllers/economicController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticateToken);
router.get('/', getEconomicImpact);

export default router;
