import crypto from 'crypto';

// Time prefix keeps ids roughly ordered and readable in a support call, the random
// suffix keeps two trips completed in the same millisecond apart. Short enough to
// hand straight to SSLCommerz as the tran_id.
const generateTransactionId = () =>
  `RA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export default generateTransactionId;
