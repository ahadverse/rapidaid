import { RequestHandler } from 'express';
import { TErrorSource } from '../interface/error';

const notFound: RequestHandler = (req, res) => {
  const errors: TErrorSource = [
    { path: req.originalUrl, message: `Cannot ${req.method} ${req.originalUrl}` },
  ];

  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    errors,
    errorSources: errors,
  });
};

export default notFound;
