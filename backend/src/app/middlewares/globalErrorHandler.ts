import { Prisma } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { config } from '../../config';
import AppError from '../errors/AppError';
import { handlePrismaKnownError, handlePrismaValidationError } from '../errors/handlePrismaError';
import handleZodError from '../errors/handleZodError';
import { TErrorSource } from '../interface/error';

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorSources: TErrorSource = [{ path: '', message }];

  if (err instanceof ZodError) {
    ({ statusCode, message, errorSources } = handleZodError(err));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    ({ statusCode, message, errorSources } = handlePrismaKnownError(err));
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    ({ statusCode, message, errorSources } = handlePrismaValidationError());
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  } else if (err instanceof Error) {
    // jsonwebtoken is matched by name so this handler stays free of an auth dependency.
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token has expired';
    } else {
      message = err.message;
    }

    errorSources = [{ path: '', message }];
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorSources,
    ...(config.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
};

export default globalErrorHandler;
