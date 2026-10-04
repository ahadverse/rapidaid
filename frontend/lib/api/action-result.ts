import type { Meta } from './types';

export type ActionResult<T = void> =
  | { ok: true; data: T; meta?: Meta }
  | { ok: false; error: string; status?: number; fieldErrors?: Record<string, string> };

export type ListResult<T> = { items: T[]; meta: Meta | undefined };

export function unwrap<T>(result: ActionResult<T>): { data: T; meta?: Meta } {
  if (!result.ok) {
    throw new Error(result.error);
  }

  return { data: result.data, meta: result.meta };
}
