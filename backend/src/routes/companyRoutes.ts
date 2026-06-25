import { Router } from 'express';
import { getCompanyDetails, updateCompanySettings, inviteUser, rotateApiKey, getApiKey } from '../controllers/companyController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { inviteUserSchema, updateCompanySchema } from '../middleware/validationSchemas';
import { UserRole } from '@prisma/client';

const router = Router();

// Invite user (Admin only)
router.post(
  '/invite-user',
  authenticateToken,
  authorizeRoles(UserRole.admin),
  validate(inviteUserSchema),
  inviteUser
);

// Get current API key (Admin only)
router.get(
  '/api-key',
  authenticateToken,
  authorizeRoles(UserRole.admin),
  getApiKey
);

// Rotate API key (Admin only)
router.post(
  '/api-key',
  authenticateToken,
  authorizeRoles(UserRole.admin),
  rotateApiKey
);

// Get company details (Authenticated users)
router.get(
  '/:id',
  authenticateToken,
  getCompanyDetails
);

// Update company details (Admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.admin),
  validate(updateCompanySchema),
  updateCompanySettings
);

export default router;
