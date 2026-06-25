import { Router } from 'express';
import { getCompanyMetrics, createOrUpdateMetric, deleteMetric, getMetricHistory, triggerSharepointSync, getPublicCompanyMetrics } from '../controllers/metricController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createMetricSchema } from '../middleware/validationSchemas';


const router = Router();

// Get metric history (static - must be before company_id params)
router.get(
  '/history',
  authenticateToken,
  getMetricHistory
);

// Sync metrics (static - must be before company_id params)
router.post(
  '/sync',
  authenticateToken,
  triggerSharepointSync
);

// Public Metrics Endpoint (For widgets)
router.get(
  '/public/:company_id',
  getPublicCompanyMetrics
);



// Get all metrics for a company
router.get(
  '/:company_id',
  authenticateToken,
  getCompanyMetrics
);

// Create or update a metric
router.post(
  '/',
  authenticateToken,
  validate(createMetricSchema),
  createOrUpdateMetric
);

// Delete a metric
router.delete(
  '/:id',
  authenticateToken,
  deleteMetric
);

export default router;
