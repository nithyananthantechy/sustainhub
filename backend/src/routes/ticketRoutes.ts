import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getCompanyTickets, createTicket, updateTicket, getTicketResponses, createTicketResponse, getTicketById } from '../controllers/ticketController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createTicketSchema, updateTicketStatusSchema, createResponseSchema } from '../middleware/validationSchemas';
import { AuthenticatedRequest, UserPayload } from '../types/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_access_key_12345';

// Optional authentication middleware for public/anonymous ticket submission
function optionalAuthenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as UserPayload;
    }
    next();
  });
}

// Get single ticket details (static - must be before dynamic company_id parameters)
router.get(
  '/detail/:id',
  authenticateToken,
  getTicketById
);


// Create new ticket (Public or authenticated)
router.post(
  '/',
  optionalAuthenticateToken,
  validate(createTicketSchema),
  createTicket
);

// Update ticket status/details (Authenticated users)
router.put(
  '/:id',
  authenticateToken,
  validate(updateTicketStatusSchema),
  updateTicket
);

// Get responses for a ticket (Authenticated users)
router.get(
  '/:id/responses',
  authenticateToken,
  getTicketResponses
);

// Respond to a ticket (Authenticated users)
router.post(
  '/:id/respond',
  authenticateToken,
  validate(createResponseSchema),
  createTicketResponse
);

// Get company tickets (Authenticated users) - placed below response sub-routes to avoid segment confusion
router.get(
  '/:company_id',
  authenticateToken,
  getCompanyTickets
);

export default router;
