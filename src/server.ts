import 'reflect-metadata';
import './container';
import { createServer } from 'node:http';
import { container } from 'tsyringe';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { SocketService } from './realtime/socket.service';

async function main() {
  await connectDatabase();

  const httpServer = createServer(createApp());
  const sockets = container.resolve(SocketService);
  sockets.init(httpServer);

  httpServer.listen(env.PORT, "0.0.0.0", () => {
    console.log(`API listening on Port :${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down`);
    await sockets.close();
    httpServer.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
