import { Router, Response, NextFunction } from 'express';
import { getCompanyStats, addOperationalStat, getStatsTrends, getPublicCompanyStats } from '../controllers/statController';
import { authenticateToken, authenticateApiKey } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createStatSchema } from '../middleware/validationSchemas';
import { AuthenticatedRequest } from '../types/auth';


const router = Router();

// Middleware to support either JWT token authentication OR API Key authentication
function authenticateUserOrApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.headers['authorization']) {
    return authenticateToken(req, res, next);
  }
  return authenticateApiKey(req, res, next);
}

// Get operational stats trends (static - before parameter routes)
router.get(
  '/trends',
  authenticateToken,
  getStatsTrends
);

// Public Stats Endpoint (For widgets)
router.get(
  '/public/:company_id',
  getPublicCompanyStats
);


// Get stats for a company
router.get(
  '/:company_id',
  authenticateToken,
  getCompanyStats
);

// Add a statistic (external script via API Key or browser user session)
router.post(
  '/',
  authenticateUserOrApiKey,
  validate(createStatSchema),
  addOperationalStat
);

export default router;
