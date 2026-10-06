'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';
import { useUrlQuery } from './use-url-query';

export function useUrlSearch(key = 'searchTerm') {
  const { get, set } = useUrlQuery();
  const urlValue = get(key);
  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value);

  useEffect(() => {
    if (debounced !== urlValue) {
      set({ [key]: debounced });
    }
    // Re-running on urlValue would push the stale input back over a Back/Forward navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return { value, setValue, applied: urlValue };
}
