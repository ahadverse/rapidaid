import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { config } from './config';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [config.clientUrl],
    credentials: true,
  }),
);

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'RapidAid API is running',
    data: {
      service: 'rapidaid-api',
      environment: config.env,
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Welcome to RapidAid — Emergency Response Platform',
    data: {
      docs: '/api/v1/health',
    },
  });
});

export default app;
