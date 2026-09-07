import { NotificationType, PaymentStatus, Prisma, Role, TripStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma, { transactionOptions } from '../../lib/prisma';
import {
  assertSslCommerzConfigured,
  initPaymentSession,
  validatePayment,
} from '../../lib/sslCommerz';
import { TJwtPayload } from '../../utils/jwt';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import generateTransactionId from '../../utils/transactionId';
import { NotificationService } from '../notification/notification.service';
import {
  DEFAULT_BILLING_CITY,
  PAYMENT_CURRENCY,
  paymentSelect,
  paymentSortableFields,
  RETRIABLE_PAYMENT_STATUSES,
  VALID_GATEWAY_STATUSES,
} from './payment.constant';
import { TCallbackPayload, TPaymentFilters } from './payment.interface';

const loadBillableTrip = async (tripId: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      status: true,
      fare: true,
      hospital: { select: { name: true } },
      request: {
        select: {
          pickupAddress: true,
          patient: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      payments: { select: { id: true, status: true } },
    },
  });

  if (!trip) {
    throw new AppError(404, 'Trip not found');
  }

  return trip;
};

const init = async (user: TJwtPayload, tripId: string) => {
  const trip = await loadBillableTrip(tripId);
  const patient = trip.request.patient;

  if (user.userId !== patient.id) {
    throw new AppError(403, 'You can only pay for your own trip');
  }

  if (trip.status !== TripStatus.COMPLETED) {
    throw new AppError(409, 'Only a completed trip can be paid for');
  }

  if (!trip.fare) {
    throw new AppError(409, 'This trip has no fare to pay');
  }

  if (trip.payments.some((payment) => payment.status === PaymentStatus.PAID)) {
    throw new AppError(409, 'This trip has already been paid for');
  }

  if (!patient.phone) {
    throw new AppError(400, 'Add a phone number to your profile before paying');
  }

  assertSslCommerzConfigured();

  const existing = trip.payments.find((payment) =>
    RETRIABLE_PAYMENT_STATUSES.includes(payment.status),
  );

  const transactionId = generateTransactionId();

  const billed = {
    transactionId,
    amount: trip.fare,
    status: PaymentStatus.PENDING,
    valId: null,
    gatewayResponse: Prisma.DbNull,
  };

  let paymentId: string;

  if (existing) {
    const claimed = await prisma.payment.updateMany({
      where: { id: existing.id, status: { in: RETRIABLE_PAYMENT_STATUSES } },
      data: billed,
    });

    if (claimed.count === 0) {
      throw new AppError(409, 'This trip has already been paid for');
    }

    paymentId = existing.id;
  } else {
    const created = await prisma.payment.create({
      data: { tripId, patientId: patient.id, ...billed },
      select: { id: true },
    });

    paymentId = created.id;
  }

  const session = await initPaymentSession({
    transactionId,
    amount: trip.fare.toFixed(2),
    productName: trip.hospital
      ? `RapidAid ambulance trip to ${trip.hospital.name}`
      : 'RapidAid ambulance trip',
    customer: {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: trip.request.pickupAddress,
      city: DEFAULT_BILLING_CITY,
    },
  });

  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    select: paymentSelect,
  });

  return { ...payment, ...session };
};

const findByTransactionId = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    select: { id: true, status: true, amount: true, transactionId: true, patientId: true },
  });

  if (!payment) {
    throw new AppError(404, 'No payment matches this transaction id');
  }

  return payment;
};

const readPayment = (id: string) =>
  prisma.payment.findUniqueOrThrow({ where: { id }, select: paymentSelect });

const settle = async (payload: TCallbackPayload) => {
  const payment = await findByTransactionId(payload.tran_id);

  if (payment.status === PaymentStatus.PAID) {
    return { settled: true, alreadySettled: true, payment: await readPayment(payment.id) };
  }

  if (!payload.val_id) {
    throw new AppError(400, 'The gateway callback carried no val_id');
  }

  const validation = await validatePayment(payload.val_id);

  if (!validation.status || !VALID_GATEWAY_STATUSES.includes(validation.status)) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { in: RETRIABLE_PAYMENT_STATUSES } },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: validation as Prisma.InputJsonObject,
      },
    });

    throw new AppError(
      402,
      `The gateway did not validate this payment (${validation.status ?? 'no status'})`,
    );
  }

  if (validation.tran_id !== payment.transactionId) {
    throw new AppError(400, 'The validated transaction does not match this payment');
  }

  if (validation.currency !== PAYMENT_CURRENCY) {
    throw new AppError(400, `This payment was settled in ${validation.currency}, not BDT`);
  }

  const paidAmount = new Prisma.Decimal(validation.amount ?? 0);

  if (!paidAmount.equals(payment.amount)) {
    throw new AppError(
      400,
      `The amount paid (${paidAmount.toFixed(2)}) does not match the fare (${payment.amount.toFixed(2)})`,
    );
  }

  const settled = await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { in: RETRIABLE_PAYMENT_STATUSES } },
      data: {
        status: PaymentStatus.PAID,
        valId: validation.val_id ?? payload.val_id,
        paidAt: new Date(),
        gatewayResponse: validation as Prisma.InputJsonObject,
      },
    });

    if (claimed.count === 0) {
      return { alreadySettled: true };
    }

    await tx.auditLog.create({
      data: {
        actorId: payment.patientId,
        action: 'PAYMENT_PAID',
        entity: 'Payment',
        entityId: payment.id,
        before: { status: payment.status },
        after: {
          status: PaymentStatus.PAID,
          amount: payment.amount.toFixed(2),
          valId: validation.val_id ?? null,
          bankTransactionId: validation.bank_tran_id ?? null,
        },
      },
    });

    await NotificationService.notify(tx, [
      {
        userId: payment.patientId,
        title: 'Payment received',
        message: `We received your payment of BDT ${payment.amount.toFixed(2)}. Thank you.`,
        type: NotificationType.PAYMENT,
      },
    ]);

    return { alreadySettled: false };
  }, transactionOptions);

  return { settled: true, ...settled, payment: await readPayment(payment.id) };
};

const abandon = async (payload: TCallbackPayload, status: PaymentStatus) => {
  const payment = await findByTransactionId(payload.tran_id);

  if (payment.status === PaymentStatus.PAID) {
    return { settled: true, alreadySettled: true, payment: await readPayment(payment.id) };
  }

  await prisma.payment.updateMany({
    where: { id: payment.id, status: { in: RETRIABLE_PAYMENT_STATUSES } },
    data: { status, gatewayResponse: payload as Prisma.InputJsonObject },
  });

  return { settled: false, alreadySettled: false, payment: await readPayment(payment.id) };
};

const success = (payload: TCallbackPayload) => settle(payload);

const ipn = (payload: TCallbackPayload) => settle(payload);

const fail = (payload: TCallbackPayload) => abandon(payload, PaymentStatus.FAILED);

const cancel = (payload: TCallbackPayload) => abandon(payload, PaymentStatus.CANCELLED);

const getMine = async (
  user: TJwtPayload,
  filters: TPaymentFilters,
  options: TPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = paymentSortableFields.includes(
    sortBy as (typeof paymentSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.PaymentWhereInput = {
    ...(user.role === Role.ADMIN ? {} : { patientId: user.userId }),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.tripId ? { tripId: filters.tripId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: paymentSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getById = async (user: TJwtPayload, id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { patientId: true },
  });

  if (!payment) {
    throw new AppError(404, 'Payment not found');
  }

  if (user.role !== Role.ADMIN && user.userId !== payment.patientId) {
    throw new AppError(403, 'You can only view your own payments');
  }

  return readPayment(id);
};

export const PaymentService = { init, success, fail, cancel, ipn, getMine, getById };
