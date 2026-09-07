import crypto from 'crypto';

const generateTransactionId = () =>
  `RA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export default generateTransactionId;
