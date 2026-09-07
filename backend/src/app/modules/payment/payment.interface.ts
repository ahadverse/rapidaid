import { PaymentStatus } from '@prisma/client';

export type TCallbackPayload = {
  tran_id: string;
  val_id?: string;
} & Record<string, unknown>;

export type TPaymentFilters = {
  status?: PaymentStatus;
  tripId?: string;
};
