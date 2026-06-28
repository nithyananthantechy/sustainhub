import { Router } from 'express';
import { getRiskAssessment } from '../controllers/riskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticateToken);
router.get('/', getRiskAssessment);

export default router;
