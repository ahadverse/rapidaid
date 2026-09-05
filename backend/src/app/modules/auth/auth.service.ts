import { Role, User, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../../../config';
import AppError from '../../errors/AppError';
import { getGoogleClient } from '../../lib/googleClient';
import prisma from '../../lib/prisma';
import { createToken, verifyToken } from '../../utils/jwt';
import { publicUserSelect } from '../user/user.constant';
import { GOOGLE_SCOPES } from './auth.constant';
import {
  TAuthTokens,
  TChangePasswordPayload,
  TLoginPayload,
  TPublicUser,
  TRegisterPayload,
} from './auth.interface';

const register = async (payload: TRegisterPayload) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const password = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  // Public registration always creates a patient; drivers and admins are provisioned by an admin.
  return prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password,
      role: Role.PATIENT,
    },
    select: publicUserSelect,
  });
};

const toPublicUser = (user: User): TPublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

const issueTokens = (user: Pick<User, 'id' | 'email' | 'role'>): TAuthTokens => {
  const payload = { userId: user.id, email: user.email, role: user.role };

  return {
    accessToken: createToken(payload, config.jwt.accessSecret, config.jwt.accessExpiresIn),
    refreshToken: createToken(payload, config.jwt.refreshSecret, config.jwt.refreshExpiresIn),
  };
};

const login = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  // One message for every credential failure so the endpoint cannot be used to discover emails.
  if (!user || user.isDeleted || !user.password) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatched) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(403, 'Your account has been blocked');
  }

  return { ...issueTokens(user), user: toPublicUser(user) };
};

const refreshToken = async (token: string | undefined) => {
  if (!token) {
    throw new AppError(401, 'Refresh token is required');
  }

  const decoded = verifyToken(token, config.jwt.refreshSecret);

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

  return issueTokens(user);
};

const changePassword = async (userId: string, payload: TChangePasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user?.password) {
    throw new AppError(400, 'Password login is not enabled for this account');
  }

  const passwordMatched = await bcrypt.compare(payload.oldPassword, user.password);

  if (!passwordMatched) {
    throw new AppError(401, 'Old password is incorrect');
  }

  if (payload.oldPassword === payload.newPassword) {
    throw new AppError(400, 'New password must be different from the old password');
  }

  const password = await bcrypt.hash(payload.newPassword, config.bcryptSaltRounds);

  await prisma.user.update({ where: { id: userId }, data: { password } });
};

const buildGoogleAuthUrl = (state: string): string =>
  getGoogleClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    state,
  });

const googleCallback = async (code: string) => {
  const client = getGoogleClient();

  // Gaxios throws its own error shape on a bad or replayed code; keep it off the 500 path.
  const exchanged = await client.getToken(code).catch(() => {
    throw new AppError(401, 'Google rejected the authorization code');
  });

  if (!exchanged.tokens.id_token) {
    throw new AppError(401, 'Google did not return an identity token');
  }

  const ticket = await client.verifyIdToken({
    idToken: exchanged.tokens.id_token,
    audience: config.google.clientId,
  });

  const profile = ticket.getPayload();

  if (!profile?.email || !profile.sub) {
    throw new AppError(401, 'Google account did not provide an email address');
  }

  if (!profile.email_verified) {
    throw new AppError(403, 'Your Google email address is not verified');
  }

  const email = profile.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.isDeleted) {
      throw new AppError(401, 'This account no longer exists');
    }

    if (existing.status === UserStatus.BLOCKED) {
      throw new AppError(403, 'Your account has been blocked');
    }

    // Link the Google identity to the existing email rather than creating a second account.
    const user = existing.googleId
      ? existing
      : await prisma.user.update({
          where: { id: existing.id },
          data: { googleId: profile.sub },
        });

    return { ...issueTokens(user), user: toPublicUser(user) };
  }

  const user = await prisma.user.create({
    data: {
      name: profile.name ?? email.split('@')[0],
      email,
      googleId: profile.sub,
      role: Role.PATIENT,
    },
  });

  return { ...issueTokens(user), user: toPublicUser(user) };
};

export const AuthService = {
  register,
  login,
  refreshToken,
  changePassword,
  buildGoogleAuthUrl,
  googleCallback,
};
