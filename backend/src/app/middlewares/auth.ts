import { Role, UserStatus } from '@prisma/client';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { config } from '../../config';
import AppError from '../errors/AppError';
import prisma from '../lib/prisma';
import catchAsync from '../utils/catchAsync';
import { verifyToken } from '../utils/jwt';

const auth = (...roles: Role[]): RequestHandler =>
  catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'You are not logged in');
    }

    const decoded = verifyToken(header.slice(7).trim(), config.jwt.accessSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true, isDeleted: true },
    });

    if (!user || user.isDeleted) {
      throw new AppError(401, 'This account no longer exists');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(403, 'Your account has been blocked');
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  });

export default auth;
