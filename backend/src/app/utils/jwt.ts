import { Role } from '@prisma/client';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export type TJwtPayload = {
  userId: string;
  email: string;
  role: Role;
};

export const createToken = (payload: TJwtPayload, secret: string, expiresIn: string): string =>
  jwt.sign(payload, secret, { expiresIn } as SignOptions);

// Throws JsonWebTokenError / TokenExpiredError, both mapped to 401 by the global handler.
export const verifyToken = (token: string, secret: string): TJwtPayload & JwtPayload =>
  jwt.verify(token, secret) as TJwtPayload & JwtPayload;
