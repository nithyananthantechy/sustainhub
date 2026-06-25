import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types/auth';

// GET /api/dashboard/:company_id
export async function getDashboardData(req: AuthenticatedRequest, res: Response) {
  const { company_id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.companyId !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Cannot access other company dashboard' });
  }

  try {
    // 1. Fetch count of metrics by category
    const metricsByCategory = await prisma.csrMetric.groupBy({
      by: ['category'],
      where: { companyId: company_id },
      _count: { id: true },
      _avg: { metricValue: true },
    });

    // 2. Fetch count of tickets by status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: { companyId: company_id },
      _count: { id: true },
    });

    // 3. Fetch count of tickets by priority
    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      where: { companyId: company_id },
      _count: { id: true },
    });

    // 4. Fetch last 5 active tickets
    const recentTickets = await prisma.ticket.findMany({
      where: { companyId: company_id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // 5. Fetch last 5 metrics changes
    const latestMetrics = await prisma.csrMetric.findMany({
      where: { companyId: company_id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // 6. Fetch last 5 operational stats entries
    const recentStats = await prisma.operationalStat.findMany({
      where: { companyId: company_id },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    return res.json({
      metricsSummary: metricsByCategory,
      ticketsByStatus,
      ticketsByPriority,
      recentTickets,
      latestMetrics,
      recentStats,
    });
  } catch (error) {
    console.error('[Dashboard Data Error]:', error);
    return res.status(500).json({ error: 'An error occurred aggregating dashboard data' });
  }
}

// GET /api/dashboard/:company_id/summary
export async function getDashboardSummary(req: AuthenticatedRequest, res: Response) {
  const { company_id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.companyId !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Cannot access other company summary' });
  }

  try {
    // Totals
    const totalTickets = await prisma.ticket.count({ where: { companyId: company_id } });
    const openTickets = await prisma.ticket.count({
      where: {
        companyId: company_id,
        status: { in: ['open', 'in_progress'] },
      },
    });
    const resolvedTickets = await prisma.ticket.count({
      where: {
        companyId: company_id,
        status: { in: ['resolved', 'closed'] },
      },
    });

    const totalMetrics = await prisma.csrMetric.count({ where: { companyId: company_id } });

    // Calculate average resolution speed in hours
    const ticketsWithResolveTime = await prisma.ticket.findMany({
      where: {
        companyId: company_id,
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let avgResolutionHours = 0;
    if (ticketsWithResolveTime.length > 0) {
      const totalHours = ticketsWithResolveTime.reduce((acc, t) => {
        const diffMs = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = parseFloat((totalHours / ticketsWithResolveTime.length).toFixed(1));
    }

    return res.json({
      totalTickets,
      openTickets,
      resolvedTickets,
      totalMetrics,
      avgResolutionHours,
    });
  } catch (error) {
    console.error('[Dashboard Summary Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching dashboard summary' });
  }
}
