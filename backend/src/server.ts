import './config/env';
import { Server } from 'http';
import app from './app';

const port = Number(process.env.PORT) || 5000;

let server: Server;

function bootstrap(): void {
  server = app.listen(port, () => {
    console.log(`🚑 RapidAid API listening on http://localhost:${port}`);
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
    server.close(() => process.exit(0));
  }
});
