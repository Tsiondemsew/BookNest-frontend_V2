'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface AuthorSuggestion {
  id: string;
  name: string;
}

export function useAuthorSearch() {
  const [suggestions, setSuggestions] = useState<AuthorSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; data: Array<{ id: string; name: string; role: string }> }>(
        `/api/users/search?role=author&q=${encodeURIComponent(query)}`,
      );
      const mapped = (response.data || []).map((u) => ({ id: u.id, name: u.name }));
      setSuggestions(mapped);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  return {
    suggestions,
    isLoading,
    showSuggestions,
    search,
    clear,
    setShowSuggestions,
  };
}

