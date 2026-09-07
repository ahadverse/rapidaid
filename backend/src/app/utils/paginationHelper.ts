export type TPaginationOptions = {
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

export type TPaginationResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const calculatePagination = (options: TPaginationOptions): TPaginationResult => {
  const page = Math.max(Math.trunc(Number(options.page)) || 1, 1);
  const requested = Math.trunc(Number(options.limit)) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(requested, 1), MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy: typeof options.sortBy === 'string' && options.sortBy ? options.sortBy : 'createdAt',
    sortOrder: options.sortOrder === 'asc' ? 'asc' : 'desc',
  };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPage: Math.ceil(total / limit) || 1,
});
