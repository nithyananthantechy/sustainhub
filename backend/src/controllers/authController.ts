import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_access_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_secret_refresh_key_12345';

// Helper to sign access token (24-hour expiry as requested)
function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Helper to sign refresh token
function generateRefreshToken(payload: object) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { companyName, companyEmail, adminName, adminEmail, password } = req.body;

  try {
    // Check if company email already registered
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail },
    });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company email is already registered' });
    }

    // Check if user email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Admin email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique API key
    const apiKey = `csrapikey_${crypto.randomBytes(24).toString('hex')}`;

    // Perform database transactions to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          apiKey,
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: UserRole.admin,
          isActive: true,
        },
      });

      return { company, user };
    }, {
      timeout: 15000 // 15 seconds to allow Neon cold-start wakeups
    });


    // Create auth tokens
    const tokenPayload = {
      id: result.user.id,
      companyId: result.company.id,
      role: result.user.role,
      email: result.user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(201).json({
      message: 'Company admin registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        apiKey: result.company.apiKey,
      },
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = {
      id: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        apiKey: user.company.apiKey,
        logoUrl: user.company.logoUrl,
        csrDataSource: user.company.csrDataSource,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      const payload = decoded as any;
      const newAccessToken = generateAccessToken({
        id: payload.id,
        companyId: payload.companyId,
        role: payload.role,
        email: payload.email,
      });

      return res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error('[Auth Refresh Error]:', error);
    return res.status(500).json({ error: 'An error occurred during token refresh' });
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  // Client is instructed to delete tokens. Server returns success.
  return res.json({ message: 'Logged out successfully' });
}
