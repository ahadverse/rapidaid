import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import sendResponse from './app/utils/sendResponse';
import { config } from './config';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [config.clientUrl],
    credentials: true,
  }),
);

app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    message: 'Welcome to RapidAid — Emergency Response Platform',
    data: {
      docs: '/api/v1/health',
    },
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
