'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface PublisherSuggestion {
  id: string;
  name: string;
}

export function usePublisherSearch() {
  const [suggestions, setSuggestions] = useState<PublisherSuggestion[]>([]);
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
        `/api/users/search?role=publisher&q=${encodeURIComponent(query)}`
      );
      const mapped = (response.data || []).map((u) => ({ id: u.id, name: u.name }));
      setSuggestions(mapped);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to search publishers:', err);
      setSuggestions([]);
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