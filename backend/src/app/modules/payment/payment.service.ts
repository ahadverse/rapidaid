import { PaymentStatus, Prisma, TripStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { assertSslCommerzConfigured, initPaymentSession } from '../../lib/sslCommerz';
import { TJwtPayload } from '../../utils/jwt';
import generateTransactionId from '../../utils/transactionId';
import {
  DEFAULT_BILLING_CITY,
  paymentSelect,
  RETRIABLE_PAYMENT_STATUSES,
} from './payment.constant';

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

  // Both checked before anything is written, so a fixable gap does not burn a
  // transaction id.
  if (!patient.phone) {
    throw new AppError(400, 'Add a phone number to your profile before paying');
  }

  assertSslCommerzConfigured();

  const existing = trip.payments.find((payment) =>
    RETRIABLE_PAYMENT_STATUSES.includes(payment.status),
  );

  // The gateway rejects a tran_id it has seen before, so every attempt gets a fresh
  // one, stored before the redirect — the callback carries nothing else to identify
  // the bill by.
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
    // Guarded on the retriable statuses: an IPN that settled this bill since the
    // read above matches nothing here instead of being dragged back to PENDING.
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

export const PaymentService = { init };
