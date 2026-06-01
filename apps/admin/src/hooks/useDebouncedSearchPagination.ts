import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/** Debounced search + page state — reset page on input change, not on debounce (avoids pagination races). */
export function useDebouncedSearchPagination(delayMs = 400) {
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchInput, delayMs);

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const clampPage = useCallback(
    (totalPages: number) => {
      if (totalPages > 0 && page > totalPages) {
        setPage(totalPages);
      }
    },
    [page],
  );

  return {
    searchInput,
    debouncedSearch,
    page,
    setPage,
    onSearchChange,
    setSearchInput,
    clampPage,
  };
}
