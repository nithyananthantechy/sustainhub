import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types/auth';
import { socketService } from '../services/socketService';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

// GET /api/tickets/:company_id
export async function getCompanyTickets(req: AuthenticatedRequest, res: Response) {
  const { company_id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.companyId !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Cannot access other company tickets' });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { companyId: company_id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tickets);
  } catch (error) {
    console.error('[Get Tickets Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching tickets' });
  }
}

// POST /api/tickets (Public or authenticated)
export async function createTicket(req: AuthenticatedRequest, res: Response) {
  const { companyId, title, description, category, priority } = req.body;
  const loggedInUser = req.user;

  // If user is logged in, override companyId with user's companyId
  const finalCompanyId = loggedInUser ? loggedInUser.companyId : companyId;
  const finalUserId = loggedInUser ? loggedInUser.id : null;

  if (!finalCompanyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        companyId: finalCompanyId,
        userId: finalUserId,
        title,
        description,
        category: category as TicketCategory,
        priority: (priority as TicketPriority) || TicketPriority.medium,
        status: TicketStatus.open,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Broadcast new ticket to company admin/manager sockets
    socketService.emitToCompany(finalCompanyId, 'ticket:created', ticket);

    return res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error('[Create Ticket Error]:', error);
    return res.status(500).json({ error: 'An error occurred creating the ticket' });
  }
}

// PUT /api/tickets/:id (Protected)
export async function updateTicket(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;
  const { status, priority } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (existingTicket.companyId !== user.companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot update tickets of another company' });
    }

    const isResolving = status && (status === TicketStatus.resolved || status === TicketStatus.closed);
    const resolvedAt = isResolving ? new Date() : existingTicket.resolvedAt;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: (status as TicketStatus) || existingTicket.status,
        priority: (priority as TicketPriority) || existingTicket.priority,
        resolvedAt,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Broadcast updated ticket status
    socketService.emitToCompany(user.companyId, 'ticket:updated', updatedTicket);

    return res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('[Update Ticket Error]:', error);
    return res.status(500).json({ error: 'An error occurred updating the ticket' });
  }
}

// GET /api/tickets/:id/responses (Protected or widget viewable if ticket is valid)
export async function getTicketResponses(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Secure checking: if user context exists, check match
    if (user && ticket.companyId !== user.companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot view this ticket\'s responses' });
    }

    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId: id },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(responses);
  } catch (error) {
    console.error('[Get Responses Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching responses' });
  }
}

// POST /api/tickets/:id/respond (Protected)
export async function createTicketResponse(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;
  const { responseText } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.companyId !== user.companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot respond to tickets of another company' });
    }

    const newResponse = await prisma.ticketResponse.create({
      data: {
        ticketId: id,
        userId: user.id,
        responseText,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Also auto-update ticket status to 'in_progress' if currently 'open'
    let updatedTicket = null;
    if (ticket.status === TicketStatus.open) {
      updatedTicket = await prisma.ticket.update({
        where: { id },
        data: { status: TicketStatus.in_progress },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
      // Broadcast ticket status change
      socketService.emitToCompany(user.companyId, 'ticket:updated', updatedTicket);
    }

    // Broadcast new response
    socketService.emitToCompany(user.companyId, 'ticket:response_added', {
      ticketId: id,
      response: newResponse,
    });

    return res.status(201).json({
      message: 'Response posted successfully',
      response: newResponse,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('[Create Response Error]:', error);
    return res.status(500).json({ error: 'An error occurred posting the response' });
  }
}

// GET /api/tickets/detail/:id
export async function getTicketById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.companyId !== user.companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other company ticket details' });
    }

    return res.json(ticket);
  } catch (error) {
    console.error('[Get Ticket By ID Error]:', error);
    return res.status(500).json({ error: 'An error occurred fetching ticket details' });
  }
}

