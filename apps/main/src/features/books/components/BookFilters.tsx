'use client';

import { useState, useEffect, useRef } from 'react';
import type { Genre } from '@repo/types';

interface BookFiltersProps {
  genres: Genre[];
  selectedGenre?: string;
  selectedFormat?: string;
  initialSearch?: string;
  onGenreChange: (genre: string) => void;
  onFormatChange: (format: string) => void;
  onSearchChange: (search: string) => void;
}

export function BookFilters({
  genres,
  selectedGenre,
  selectedFormat,
  initialSearch = '',
  onGenreChange,
  onFormatChange,
  onSearchChange,
}: BookFiltersProps) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const lastEmittedSearch = useRef(initialSearch);

  useEffect(() => {
    setSearchInput(initialSearch);
    lastEmittedSearch.current = initialSearch;
  }, [initialSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput === lastEmittedSearch.current) return;
      lastEmittedSearch.current = searchInput;
      onSearchChange(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] p-5 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all text-[#1A2A3A] placeholder:text-[#4A5568]"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={selectedGenre || ''}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all text-[#1A2A3A] bg-white cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-32">
          <select
            value={selectedFormat || ''}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all text-[#1A2A3A] bg-white cursor-pointer"
          >
            <option value="">All Formats</option>
            <option value="PDF">PDF</option>
            <option value="Audio">Audio</option>
          </select>
        </div>
      </div>
    </div>
  );
}
