import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserPayload } from '../types/auth';
import prisma from '../config/db';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_access_key_12345';

// Authenticate user via JWT Bearer Token
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    req.user = decoded as UserPayload;
    next();
  });
}

// Authorize based on roles
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
}

// Authenticate external client via X-API-KEY header
export async function authenticateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.header('X-API-KEY') || req.header('x-api-key');

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required in X-API-KEY header' });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { apiKey },
    });

    if (!company) {
      return res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }

    req.company = {
      id: company.id,
      name: company.name,
      apiKey: company.apiKey,
    };
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error validating API key' });
  }
}
