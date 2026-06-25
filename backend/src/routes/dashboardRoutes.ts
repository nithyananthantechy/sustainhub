import { Router } from 'express';
import { getDashboardData, getDashboardSummary } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get summary metrics (static subpath - must be before dynamic company_id parameters)
router.get(
  '/:company_id/summary',
  authenticateToken,
  getDashboardSummary
);

// Get main dashboard layout data
router.get(
  '/:company_id',
  authenticateToken,
  getDashboardData
);

export default router;
