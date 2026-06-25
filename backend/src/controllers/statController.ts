import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types/auth';
import { socketService } from '../services/socketService';

// GET /api/stats/:company_id
export async function getCompanyStats(req: AuthenticatedRequest, res: Response) {
  const { company_id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.companyId !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Cannot access other company stats' });
  }

  try {
    const stats = await prisma.operationalStat.findMany({
      where: { companyId: company_id },
      orderBy: { timestamp: 'desc' },
      take: 100, // limit to last 100 entries
    });

    return res.json(stats);
  } catch (error) {
    console.error('[Get Stats Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching operational stats' });
  }
}

// POST /api/stats (Can be authenticated via user token OR company API Key)
export async function addOperationalStat(req: AuthenticatedRequest, res: Response) {
  const { statName, statValue, statUnit, timestamp } = req.body;
  let companyId: string | null = null;

  if (req.user) {
    companyId = req.user.companyId;
  } else if (req.company) {
    companyId = req.company.id;
  }

  if (!companyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const newStat = await prisma.operationalStat.create({
      data: {
        companyId,
        statName,
        statValue,
        statUnit,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Broadcast live stats update to Socket.io room
    socketService.emitToCompany(companyId, 'stat:added', newStat);

    return res.status(201).json({
      message: 'Operational statistic added successfully',
      stat: newStat,
    });
  } catch (error) {
    console.error('[Add Stat Error]:', error);
    return res.status(500).json({ error: 'An error occurred saving the statistic' });
  }
}

// GET /api/stats/trends
export async function getStatsTrends(req: AuthenticatedRequest, res: Response) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch stats for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await prisma.operationalStat.findMany({
      where: {
        companyId: user.companyId,
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // If no stats exist, populate with default mock trend data for visual graphing
    if (stats.length === 0) {
      const defaultStats = ['Active Users', 'Server Load', 'Requests Processed'];
      const mockStats = [];
      const now = new Date();

      for (const name of defaultStats) {
        let baseVal = name === 'Active Users' ? 500 : name === 'Server Load' ? 45 : 1200;
        const unit = name === 'Active Users' ? 'users' : name === 'Server Load' ? '%' : 'req/s';

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          
          // Seeded fluctuation
          const variance = (Math.sin(i) * baseVal * 0.1); // +/- 10%
          mockStats.push({
            id: `mock-stat-${name}-${i}`,
            companyId: user.companyId,
            statName: name,
            statValue: parseFloat((baseVal + variance).toFixed(2)),
            statUnit: unit,
            timestamp: date.toISOString(),
          });
        }
      }
      return res.json(mockStats);
    }

    return res.json(stats);
  } catch (error) {
    console.error('[Get Trends Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching trends' });
  }
}

// GET /api/stats/public/:company_id (Public endpoint for Widgets)
export async function getPublicCompanyStats(req: any, res: Response) {
  const { company_id } = req.params;

  try {
    const stats = await prisma.operationalStat.findMany({
      where: { companyId: company_id },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return res.json(stats);
  } catch (error) {
    console.error('[Get Public Stats Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching public stats' });
  }
}

