'use client';

import { useState, useEffect } from 'react';
import type { Genre } from '@repo/types';

interface BookFiltersProps {
  genres: Genre[];
  selectedGenre?: string;
  selectedFormat?: string;
  onGenreChange: (genre: string) => void;
  onFormatChange: (format: string) => void;
  onSearchChange: (search: string) => void;
}

export function BookFilters({
  genres,
  selectedGenre,
  selectedFormat,
  onGenreChange,
  onFormatChange,
  onSearchChange,
}: BookFiltersProps) {
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Genre Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedGenre || ''}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Format Filter */}
        <div className="w-full md:w-32">
          <select
            value={selectedFormat || ''}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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