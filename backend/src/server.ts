import dotenv from 'dotenv';
// Load environment variables before importing modules
dotenv.config();

import http from 'http';
import app from './app';
import { socketService } from './services/socketService';
import { sharepointService } from './services/sharepointService';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping express application
const server = http.createServer(app);

// Initialize Socket.io WebSocket service
socketService.init(server);

// Start SharePoint List Sync background scheduler
sharepointService.startScheduler();

// Start HTTP server listening
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 CSR & Operations API Server running on port ${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

// Graceful Shutdown Handler
async function gracefulShutdown(signal: string) {
  console.log(`\n[${signal}] Received. Starting graceful shutdown...`);
  
  // Stop SharePoint sync timer
  sharepointService.stopScheduler();

  // Close HTTP & WebSocket connections
  server.close(() => {
    console.log('[Server] HTTP connections closed.');
  });

  // Disconnect from database
  try {
    await prisma.$disconnect();
    console.log('[Database] Disconnected Prisma client.');
  } catch (err) {
    console.error('[Database] Error disconnecting Prisma client:', err);
  }

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
