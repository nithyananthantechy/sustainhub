import { Request, Response } from 'express';
import prisma from '../config/db';

export const handleAIChat = async (req: Request, res: Response) => {
  const { message, companyId } = req.body;
  
  if (!message || !companyId) {
    return res.status(400).json({ error: 'Message and companyId are required' });
  }

  try {
    // 1. Simulate RAG context lookup based on message keywords
    const lowerMessage = message.toLowerCase();
    let reply = "Thank you for reaching out to CommunityGPT. A support representative will review your message shortly.";
    let isResolved = false;

    if (lowerMessage.includes('noise') || lowerMessage.includes('loud')) {
      reply = "We are currently conducting standard backup generator tests which cause temporary noise. This is fully compliant with municipal noise ordinances (Max 65dB) and will conclude at 5:00 PM today. Thank you for your patience.";
      isResolved = true;
    } else if (lowerMessage.includes('smoke') || lowerMessage.includes('cloud')) {
      reply = "What you are seeing is harmless water vapor from our evaporative cooling towers, not smoke. Our live air quality sensors show 0 PPM of particulate matter in your area. Is there anything else you need help with?";
      isResolved = true;
    }

    // 2. Log the chat into the Tickets table for analytics
    const newTicket = await prisma.ticket.create({
      data: {
        companyId,
        title: `Community Chat: ${message.substring(0, 30)}...`,
        description: message,
        category: 'complaint',
        status: isResolved ? 'resolved' : 'open',
        aiResolved: isResolved,
        chatTranscript: JSON.stringify([
          { role: 'user', content: message },
          { role: 'assistant', content: reply }
        ])
      }
    });

    res.json({
      reply,
      isResolved,
      ticketId: newTicket.id
    });
  } catch (error) {
    console.error('Error in Grievance AI:', error);
    res.status(500).json({ error: 'Failed to process AI chat' });
  }
};
