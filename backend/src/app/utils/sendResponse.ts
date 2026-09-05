import { Response } from 'express';

export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

type TResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
};

const sendResponse = <T>(res: Response, { statusCode, message, data, meta }: TResponse<T>): void => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    ...(meta ? { meta } : {}),
    data,
  });
};

export default sendResponse;
