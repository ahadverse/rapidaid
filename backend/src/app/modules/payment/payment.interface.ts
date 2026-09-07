export type TCallbackPayload = {
  tran_id: string;
  val_id?: string;
} & Record<string, unknown>;
