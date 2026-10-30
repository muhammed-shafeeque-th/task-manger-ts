import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { singleton } from 'tsyringe';
import { env } from '../config/env';
import { verifyToken } from '../shared/jwt';
import type { SocketEvent } from './events';

const userRoom = (userId: string) => `user:${userId}`;

@singleton()
export class SocketService {
  private io?: Server;

  init(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: { origin: env.CLIENT_ORIGINS, credentials: true },
    });

    // Authenticate every connection with the same JWT used for the REST API.
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string') return next(new Error('Authentication required'));
      try {
        socket.data.userId = verifyToken(token).sub;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket) => {
      // Each user only receives events for their own tasks (all their devices/tabs).
      socket.join(userRoom(socket.data.userId as string));
    });
  }

  /**
   * Emits to every socket of a user. `exceptSocketId` lets the originating tab skip the echo,
   * since it already has the HTTP response.
   */
  emitToUser<T>(userId: string, event: SocketEvent, payload: T, exceptSocketId?: string): void {
    if (!this.io) return;
    let target = this.io.to(userRoom(userId));
    if (exceptSocketId) target = target.except(exceptSocketId);
    target.emit(event, payload);
  }

  async close(): Promise<void> {
    await this.io?.close();
  }
}
