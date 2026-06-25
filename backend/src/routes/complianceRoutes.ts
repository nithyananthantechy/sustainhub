import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { complianceService } from '../services/complianceService';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

// GET /api/compliance/:companyId
router.get(
  '/:companyId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { companyId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.companyId !== companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other company compliance report' });
    }

    try {
      const forceRefresh = req.query.refresh === 'true';
      const report = await complianceService.generateComplianceReport(companyId, forceRefresh);
      return res.json(report);
    } catch (error: any) {
      console.error('[Compliance Route Error]:', error);
      return res.status(500).json({ error: error.message || 'An error occurred generating compliance report' });
    }
  }
);

// GET /api/compliance/:companyId/metric/:metricName
router.get(
  '/:companyId/metric/:metricName',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { companyId, metricName } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.companyId !== companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other company metrics' });
    }

    try {
      const result = await complianceService.analyzeMetric(
        metricName,
        100, // example base value
        'EU_CARBON_2050' // example default standard
      );
      return res.json(result);
    } catch (error: any) {
      console.error('[Compliance Metric Route Error]:', error);
      return res.status(500).json({ error: error.message || 'An error occurred analyzing metric' });
    }
  }
);

// GET /api/compliance/standards/list
router.get(
  '/standards/list',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    return res.json({
      EU_CARBON_2050: {
        name: 'EU Carbon Neutrality 2050',
        region: 'EU',
        type: 'environmental',
      },
      EU_ENERGY_EFFICIENCY: {
        name: 'EU Energy Efficiency 2030',
        region: 'EU',
        type: 'environmental',
      },
      ISO_50001: {
        name: 'ISO 50001 Energy Management',
        region: 'Global',
        type: 'environmental',
      },
      GERMAN_STROMSTG: {
        name: 'German StromStG',
        region: 'Germany',
        type: 'environmental',
      },
      WATER_MANAGEMENT: {
        name: 'Water Usage Standards',
        region: 'Global',
        type: 'environmental',
      },
      WASTE_RECYCLING: {
        name: 'Waste Recycling Target',
        region: 'EU',
        type: 'environmental',
      },
      ISO_30415: {
        name: 'ISO 30415 Diversity & Inclusion',
        region: 'Global',
        type: 'social',
      },
      UN_SDG_COMMUNITY: {
        name: 'UN SDG 11 Community Support',
        region: 'Global',
        type: 'social',
      },
      LOCAL_PROCUREMENT: {
        name: 'Local Supply Chain Standard',
        region: 'Global',
        type: 'economic',
      }
    });
  }
);

export default router;
