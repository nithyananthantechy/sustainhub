import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCircularStats = async (req: any, res: Response) => {
  try {
    const stats = await prisma.circularEconomyStat.findMany({
      where: { companyId: req.user?.companyId },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching circular economy stats:', error);
    res.status(500).json({ error: 'Failed to fetch circular economy stats' });
  }
};
