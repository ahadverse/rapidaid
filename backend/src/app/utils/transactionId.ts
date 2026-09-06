import crypto from 'crypto';

// Time prefix keeps ids ordered, the random suffix separates two completions in
// the same millisecond. Doubles as the SSLCommerz tran_id.
const generateTransactionId = () =>
  `RA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export default generateTransactionId;
