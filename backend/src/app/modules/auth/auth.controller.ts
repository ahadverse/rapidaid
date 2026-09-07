import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { config } from '../../../config';
import AppError from '../../errors/AppError';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_STATE_MAX_AGE_MS,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
} from './auth.constant';
import { AuthService } from './auth.service';

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken, ...result } = await AuthService.login(req.body);

  setRefreshCookie(res, refreshToken);

  sendResponse(res, {
    statusCode: 200,
    message: 'Login successful',
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const tokens = await AuthService.refreshToken(req.cookies?.[REFRESH_COOKIE_NAME]);

  setRefreshCookie(res, tokens.refreshToken);

  sendResponse(res, {
    statusCode: 200,
    message: 'Access token refreshed',
    data: { accessToken: tokens.accessToken },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePassword(authUser(req).userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Password changed successfully',
    data: null,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
  });

  sendResponse(res, {
    statusCode: 200,
    message: 'Logged out successfully',
    data: null,
  });
});

const googleLogin = catchAsync(async (_req: Request, res: Response) => {
  const state = randomBytes(16).toString('hex');

  res.cookie(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
  });

  res.redirect(AuthService.buildGoogleAuthUrl(state));
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    throw new AppError(401, 'Google sign-in was cancelled');
  }

  const expectedState = req.cookies?.[OAUTH_STATE_COOKIE_NAME];

  if (!state || !expectedState || state !== expectedState) {
    throw new AppError(401, 'Invalid OAuth state');
  }

  res.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
  });

  if (typeof code !== 'string') {
    throw new AppError(400, 'Authorization code is required');
  }

  const { refreshToken: newRefreshToken, ...result } = await AuthService.googleCallback(code);

  setRefreshCookie(res, newRefreshToken);

  sendResponse(res, {
    statusCode: 200,
    message: 'Google login successful',
    data: result,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  changePassword,
  logout,
  googleLogin,
  googleCallback,
};
