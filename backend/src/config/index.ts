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
  redisUrl: optionalEnv('REDIS_URL', ''),
  rateLimit: {
    windowMs: Number(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000')),
    max: Number(optionalEnv('RATE_LIMIT_MAX', '300')),
    authMax: Number(optionalEnv('RATE_LIMIT_AUTH_MAX', '20')),
  },
  jwt: {
    accessSecret: requiredEnv('JWT_ACCESS_SECRET'),
    accessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES_IN', '1d'),
    refreshSecret: requiredEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
  google: {
    clientId: optionalEnv('GOOGLE_CLIENT_ID', ''),
    clientSecret: optionalEnv('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: optionalEnv('GOOGLE_CALLBACK_URL', ''),
  },
  ssl: {
    storeId: optionalEnv('SSL_STORE_ID', ''),
    storePass: optionalEnv('SSL_STORE_PASS', ''),
    paymentApi: optionalEnv(
      'SSL_PAYMENT_API',
      'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
    ),
    validationApi: optionalEnv(
      'SSL_VALIDATION_API',
      'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
    ),
    successUrl: optionalEnv('SSL_SUCCESS_URL', ''),
    failUrl: optionalEnv('SSL_FAIL_URL', ''),
    cancelUrl: optionalEnv('SSL_CANCEL_URL', ''),
    ipnUrl: optionalEnv('SSL_IPN_URL', ''),
  },
};
