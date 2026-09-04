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
};
