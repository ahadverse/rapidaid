import './env';

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv !== 'development' && nodeEnv !== 'production') {
  throw new Error(`Invalid NODE_ENV "${nodeEnv}". Expected "development" or "production".`);
}

export function requiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(optionalEnv('PORT', '5000')),
  clientUrl: optionalEnv('CLIENT_URL', 'http://localhost:3000'),
  databaseUrl: requiredEnv('DATABASE_URL'),
  bcryptSaltRounds: Number(optionalEnv('BCRYPT_SALT_ROUNDS', '12')),
  jwt: {
    accessSecret: requiredEnv('JWT_ACCESS_SECRET'),
    accessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES_IN', '1d'),
    refreshSecret: requiredEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
  // Optional so the API still boots without GCP credentials; the routes report 503 instead.
  google: {
    clientId: optionalEnv('GOOGLE_CLIENT_ID', ''),
    clientSecret: optionalEnv('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: optionalEnv('GOOGLE_CALLBACK_URL', ''),
  },
};
