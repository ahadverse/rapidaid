const pickQuery = <T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: K[],
): Partial<Pick<T, K>> => {
  const result: Partial<Pick<T, K>> = {};

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== '') {
      result[key] = value;
    }
  }

  return result;
};

export default pickQuery;
