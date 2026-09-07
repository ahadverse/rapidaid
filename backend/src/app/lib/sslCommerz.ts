import { config } from '../../config';
import AppError from '../errors/AppError';
import { PAYMENT_CURRENCY, SSL_REQUEST_TIMEOUT_MS } from '../modules/payment/payment.constant';

export type TSslCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type TSslInitInput = {
  transactionId: string;
  amount: string;
  productName: string;
  customer: TSslCustomer;
};

type TSslInitResponse = {
  status?: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
};

export type TSslValidation = {
  status?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  bank_tran_id?: string;
  card_type?: string;
  tran_date?: string;
  risk_level?: string;
  error?: string;
};

export const assertSslCommerzConfigured = (): void => {
  if (!config.ssl.storeId || !config.ssl.storePass) {
    throw new AppError(503, 'Online payment is not configured on this server');
  }
};

const requestJson = async (url: string, init?: RequestInit): Promise<unknown> => {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(SSL_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new AppError(502, 'Could not reach the payment gateway, please try again');
  }

  if (!response.ok) {
    throw new AppError(502, `The payment gateway returned an error (${response.status})`);
  }

  try {
    return await response.json();
  } catch {
    throw new AppError(502, 'The payment gateway sent a response we could not read');
  }
};

const buildInitBody = (input: TSslInitInput): URLSearchParams =>
  new URLSearchParams({
    store_id: config.ssl.storeId,
    store_passwd: config.ssl.storePass,
    total_amount: input.amount,
    currency: PAYMENT_CURRENCY,
    tran_id: input.transactionId,
    success_url: config.ssl.successUrl,
    fail_url: config.ssl.failUrl,
    cancel_url: config.ssl.cancelUrl,
    ipn_url: config.ssl.ipnUrl,
    product_name: input.productName,
    product_category: 'Emergency Service',
    product_profile: 'non-physical-goods',
    shipping_method: 'NO',
    num_of_item: '1',
    cus_name: input.customer.name,
    cus_email: input.customer.email,
    cus_phone: input.customer.phone,
    cus_add1: input.customer.address,
    cus_city: input.customer.city,
    cus_country: 'Bangladesh',
  });

export const initPaymentSession = async (input: TSslInitInput) => {
  assertSslCommerzConfigured();

  const data = (await requestJson(config.ssl.paymentApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildInitBody(input),
  })) as TSslInitResponse;

  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new AppError(
      502,
      data.failedreason?.trim() || 'The payment gateway did not return a checkout page',
    );
  }

  return {
    gatewayPageURL: data.GatewayPageURL,
    sessionKey: data.sessionkey ?? null,
  };
};

export const validatePayment = async (valId: string): Promise<TSslValidation> => {
  assertSslCommerzConfigured();

  const url = new URL(config.ssl.validationApi);
  url.searchParams.set('val_id', valId);
  url.searchParams.set('store_id', config.ssl.storeId);
  url.searchParams.set('store_passwd', config.ssl.storePass);
  url.searchParams.set('format', 'json');

  return (await requestJson(url.toString())) as TSslValidation;
};
