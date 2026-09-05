import { RequestHandler } from 'express';

const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    errorSources: [
      { path: req.originalUrl, message: `Cannot ${req.method} ${req.originalUrl}` },
    ],
  });
};

export default notFound;
