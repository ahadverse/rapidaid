import type { ApiErrorSource } from './types';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: ApiErrorSource[];

  constructor(statusCode: number, message: string, errors: ApiErrorSource[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }

  fieldErrors(): Record<string, string> {
    const fields: Record<string, string> = {};

    for (const { path, message } of this.errors) {
      if (path && !(path in fields)) {
        fields[path] = message;
      }
    }

    return fields;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
