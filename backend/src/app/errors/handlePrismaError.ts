import { Prisma } from '@prisma/client';
import { TGenericErrorResponse } from '../interface/error';

export const handlePrismaKnownError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenericErrorResponse => {
  switch (err.code) {
    case 'P2002': {
      const target = (err.meta?.target as string[] | undefined) ?? [];
      const field = target.join(', ') || 'field';

      return {
        statusCode: 409,
        message: 'Duplicate entry',
        errorSources: [{ path: field, message: `${field} already exists` }],
      };
    }

    case 'P2003': {
      const field = (err.meta?.field_name as string | undefined) ?? 'relation';

      return {
        statusCode: 400,
        message: 'Invalid reference',
        errorSources: [{ path: field, message: 'Related record does not exist' }],
      };
    }

    case 'P2025':
      return {
        statusCode: 404,
        message: 'Not Found',
        errorSources: [
          { path: '', message: (err.meta?.cause as string | undefined) ?? 'Record not found' },
        ],
      };

    default:
      return {
        statusCode: 400,
        message: 'Database request failed',
        errorSources: [{ path: '', message: `Prisma error ${err.code}` }],
      };
  }
};

export const handlePrismaValidationError = (): TGenericErrorResponse => ({
  statusCode: 400,
  message: 'Validation Error',
  errorSources: [{ path: '', message: 'Invalid data provided to the database query' }],
});
