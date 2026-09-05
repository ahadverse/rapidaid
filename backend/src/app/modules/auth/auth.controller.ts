import { Request, Response } from 'express';
import { config } from '../../../config';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { REFRESH_COOKIE_MAX_AGE_MS, REFRESH_COOKIE_NAME } from './auth.constant';
import { AuthService } from './auth.service';

// sameSite none is required once the API and the client sit on different domains,
// and browsers only accept it together with secure.
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

export const AuthController = { register, login, refreshToken, changePassword, logout };
