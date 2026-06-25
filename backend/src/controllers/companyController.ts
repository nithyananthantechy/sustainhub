import { Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '@prisma/client';

// GET /api/companies/:id
export async function getCompanyDetails(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // A user can only access their own company details
  if (user.companyId !== id) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to view this company' });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json(company);
  } catch (error) {
    console.error('[Get Company Details Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching company details' });
  }
}

// PUT /api/companies/:id
export async function updateCompanySettings(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;
  const { name, logoUrl, csrDataSource, sharepointTenantId, sharepointListId, monthlyRpc } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.companyId !== id) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this company' });
  }

  try {
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name,
        logoUrl,
        csrDataSource,
        sharepointTenantId,
        sharepointListId,
        monthlyRpc,
      },
    });

    return res.json({
      message: 'Company settings updated successfully',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('[Update Company Settings Error]:', error);
    return res.status(500).json({ error: 'An error occurred updating company settings' });
  }
}

// POST /api/companies/invite-user (Admin Only)
export async function inviteUser(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  const { name, email, role } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Generate a default temporary password
    const tempPassword = 'welcome123_change_me';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        companyId: user.companyId,
        name,
        email,
        passwordHash,
        role: role as UserRole,
        isActive: true,
      },
    });

    return res.status(201).json({
      message: 'User invited successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      temporaryPassword: tempPassword,
    });
  } catch (error) {
    console.error('[Invite User Error]:', error);
    return res.status(500).json({ error: 'An error occurred while inviting the user' });
  }
}

// POST /api/companies/api-key (Admin Only - generates or rotates API Key)
export async function rotateApiKey(req: AuthenticatedRequest, res: Response) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const newApiKey = `csrapikey_${crypto.randomBytes(24).toString('hex')}`;

    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: { apiKey: newApiKey },
      select: { apiKey: true },
    });

    return res.json({
      message: 'API Key rotated successfully',
      apiKey: updatedCompany.apiKey,
    });
  } catch (error) {
    console.error('[Rotate API Key Error]:', error);
    return res.status(500).json({ error: 'An error occurred while rotating the API key' });
  }
}

// GET /api/companies/api-key (Admin Only)
export async function getApiKey(req: AuthenticatedRequest, res: Response) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { apiKey: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ apiKey: company.apiKey });
  } catch (error) {
    console.error('[Get API Key Error]:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving the API key' });
  }
}

