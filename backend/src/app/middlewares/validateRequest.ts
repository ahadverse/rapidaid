import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodType } from 'zod';
import catchAsync from '../utils/catchAsync';

type TValidated = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

const validateRequest = (schema: ZodType): RequestHandler =>
  catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const parsed = (await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    })) as TValidated;

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    if (parsed.params !== undefined) {
      req.params = parsed.params as Request['params'];
    }

    if (parsed.query !== undefined) {
      req.query = parsed.query as Request['query'];
    }

    next();
  });

export default validateRequest;
