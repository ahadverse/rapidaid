import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config';
import AppError from '../errors/AppError';

export const isGoogleConfigured = (): boolean =>
  Boolean(config.google.clientId && config.google.clientSecret && config.google.callbackUrl);

export const getGoogleClient = (): OAuth2Client => {
  if (!isGoogleConfigured()) {
    throw new AppError(503, 'Google sign-in is not configured on this server');
  }

  return new OAuth2Client({
    clientId: config.google.clientId,
    clientSecret: config.google.clientSecret,
    redirectUri: config.google.callbackUrl,
  });
};
