// BD mobile format: optional +880/880/0 prefix, operator digit 3-9, then 8 digits.
export const BD_PHONE_REGEX = /^(?:\+880|880|0)1[3-9]\d{8}$/;

export const PASSWORD_MIN_LENGTH = 8;

export const REFRESH_COOKIE_NAME = 'refreshToken';

// Matches JWT_REFRESH_EXPIRES_IN so the cookie and the token expire together.
export const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const OAUTH_STATE_COOKIE_NAME = 'oauthState';

export const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

export const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

// Shared select so a password hash can never leave the service by accident.
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
} as const;
