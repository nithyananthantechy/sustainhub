import { Request, Response } from 'express';
import prisma from '../config/db';

export const getEconomicImpact = async (req: any, res: Response) => {
  try {
    const impact = await prisma.economicImpact.findFirst({
      where: { companyId: req.user?.companyId },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(impact || {});
  } catch (error) {
    console.error('Error fetching economic impact:', error);
    res.status(500).json({ error: 'Failed to fetch economic impact' });
  }
};
