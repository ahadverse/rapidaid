import { NextFunction, Request, RequestHandler, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../../config';
import AppError from '../errors/AppError';

// Throttled requests are handed to the global error handler so a 429 looks like
// every other error response.
const reject = (message: string) => (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(429, message));
};

export const apiLimiter: RequestHandler = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: reject('Too many requests, please slow down and try again later'),
});

export const authLimiter: RequestHandler = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.authMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: reject('Too many authentication attempts, please try again later'),
});
