import { z } from 'zod';
import { CsrDataSource, UserRole, MetricCategory, TicketCategory, TicketStatus, TicketPriority } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required').max(255),
    companyEmail: z.string().email('Invalid company email').max(255),
    adminName: z.string().min(1, 'Admin name is required').max(255),
    adminEmail: z.string().email('Invalid admin email').max(255),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required').optional(),
    logoUrl: z.string().url('Invalid logo URL').nullable().optional(),
    csrDataSource: z.nativeEnum(CsrDataSource).optional(),
    sharepointTenantId: z.string().nullable().optional(),
    sharepointListId: z.string().nullable().optional(),
    monthlyRpc: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  }),
});

export const inviteUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid user email'),
    role: z.nativeEnum(UserRole).default(UserRole.user),
  }),
});

export const createMetricSchema = z.object({
  body: z.object({
    metricName: z.string().min(1, 'Metric name is required'),
    metricValue: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    metricUnit: z.string().min(1, 'Metric unit is required'),
    category: z.nativeEnum(MetricCategory),
    description: z.string().optional(),
  }),
});

export const createStatSchema = z.object({
  body: z.object({
    statName: z.string().min(1, 'Stat name is required'),
    statValue: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    statUnit: z.string().min(1, 'Stat unit is required'),
    timestamp: z.string().datetime({ message: 'Invalid ISO datetime' }).optional().transform((val) => val ? new Date(val) : undefined),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    companyId: z.string().uuid('Invalid company ID').optional(),
    title: z.string().min(1, 'Ticket title is required').max(255),
    description: z.string().min(1, 'Ticket description is required'),
    category: z.nativeEnum(TicketCategory),
    priority: z.nativeEnum(TicketPriority).default(TicketPriority.medium),
    userId: z.string().uuid('Invalid user ID').optional(),
  }),
});

export const updateTicketStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(TicketStatus),
  }),
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
});

export const createResponseSchema = z.object({
  body: z.object({
    responseText: z.string().min(1, 'Response content is required'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
});
