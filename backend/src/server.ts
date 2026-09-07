import { config } from './config';
import { Server } from 'http';
import app from './app';
import { disconnectRedis } from './app/lib/redis';

let server: Server;

function bootstrap(): void {
  server = app.listen(config.port, () => {
    console.log(`RapidAid API listening on http://localhost:${config.port} in ${config.env}`);
  });
}

bootstrap();

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection detected, shutting down...', reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('uncaughtException detected, shutting down...', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  if (server) {
    server.close(() => {
      void disconnectRedis().finally(() => process.exit(0));
    });
  }
});
