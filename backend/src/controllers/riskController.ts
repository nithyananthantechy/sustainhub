import { Request, Response } from 'express';
import prisma from '../config/db';

export const getRiskAssessment = async (req: any, res: Response) => {
  try {
    const risk = await prisma.riskAssessment.findFirst({
      where: { companyId: req.user?.companyId },
      orderBy: { createdAt: 'desc' },
    });
    let responseData = risk || {};
    if (risk) {
      responseData = {
        ...risk,
        topRiskFactors: typeof risk.topRiskFactors === 'string' ? JSON.parse(risk.topRiskFactors) : risk.topRiskFactors,
        aiRecommendations: typeof risk.aiRecommendations === 'string' ? JSON.parse(risk.aiRecommendations) : risk.aiRecommendations,
      };
    }
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching risk assessment:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
};
