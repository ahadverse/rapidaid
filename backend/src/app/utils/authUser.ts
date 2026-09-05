import { Request } from 'express';
import AppError from '../errors/AppError';
import { TJwtPayload } from './jwt';

// req.user is optional on the Express type because unauthenticated routes exist;
// this narrows it for handlers that sit behind the auth middleware.
const authUser = (req: Request): TJwtPayload => {
  if (!req.user) {
    throw new AppError(401, 'You are not logged in');
  }

  return req.user;
};

export default authUser;
