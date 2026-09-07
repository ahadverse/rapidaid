import { Request } from 'express';
import AppError from '../errors/AppError';
import { TJwtPayload } from './jwt';

const authUser = (req: Request): TJwtPayload => {
  if (!req.user) {
    throw new AppError(401, 'You are not logged in');
  }

  return req.user;
};

export default authUser;
