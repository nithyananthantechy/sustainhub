import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface UserPayload {
  id: string;
  companyId: string;
  role: UserRole;
  email: string;
}

export interface CompanyPayload {
  id: string;
  name: string;
  apiKey: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
  company?: CompanyPayload;
}
