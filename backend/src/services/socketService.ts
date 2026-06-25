import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_access_key_12345';

class SocketService {
  private io: Server | null = null;

  init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Authentication middleware for Socket.io connections
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as UserPayload;
        socket.data.user = decoded;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user as UserPayload;
      console.log(`[Socket] User ${user.email} (${user.role}) connected from company: ${user.companyId}`);
      
      // Join a company-specific room for targeted broadcasts
      socket.join(user.companyId);

      socket.on('disconnect', () => {
        console.log(`[Socket] User ${user.email} disconnected`);
      });
    });
  }

  // Helper method to emit events to all sockets in a specific company room
  emitToCompany(companyId: string, eventName: string, data: any) {
    if (this.io) {
      console.log(`[Socket] Broadcasting event ${eventName} to company ${companyId}`);
      this.io.to(companyId).emit(eventName, data);
    } else {
      console.warn(`[Socket] Server not initialized. Failed to emit ${eventName}`);
    }
  }
}

export const socketService = new SocketService();
