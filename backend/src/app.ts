import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { landingPage } from './app/docs/landing';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { apiLimiter } from './app/middlewares/rateLimiter';
import router from './app/routes';
import { config } from './config';

const app: Application = express();

app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.clientUrls,
    credentials: true,
  }),
);

app.use('/api/v1', apiLimiter, router);

app.get('/', (_req: Request, res: Response) => {
  res.type('html').send(landingPage);
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
