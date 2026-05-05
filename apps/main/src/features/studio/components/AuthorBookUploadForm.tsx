'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useGenres } from '@/features/books/hooks/useBooks';
import { useBookUpload } from '../hooks/useBookUpload';
import { usePublisherSearch } from '../hooks/usePublisherSearch';
import type { Genre } from '@repo/types';

// Form validation schema (local to component, not shared types)
const bookUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  publication_date: z.string().optional(),
  genre_id: z.string().min(1, 'Genre is required'),
  publisher_id: z.string().optional(),
  publisher_name: z.string().optional(),
  pdf_price: z.number().min(0, 'Price must be 0 or greater').optional(),
  pdf_page_count: z.number().min(1, 'Page count is required for PDF').optional(),
  audio_price: z.number().min(0, 'Price must be 0 or greater').optional(),
  audio_duration_sec: z.number().min(1, 'Duration is required for Audio').optional(),
});

type BookUploadFormData = z.infer<typeof bookUploadSchema>;

export function AuthorBookUploadForm() {
  const { user } = useAuthStore();
  const { data: genresData } = useGenres();
  const genres = (genresData as Genre[]) || [];
  const { uploadBook, isSubmitting, error, clearError } = useBookUpload();
  const { suggestions, showSuggestions, search, setShowSuggestions, isLoading: isSearching } = usePublisherSearch();
  
  // File states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [hasPdf, setHasPdf] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [publisherSearchTerm, setPublisherSearchTerm] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookUploadFormData>({
    resolver: zodResolver(bookUploadSchema),
    defaultValues: {
      language: 'English',
      publication_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedPublisherId = watch('publisher_id');

  const onSubmit = async (data: BookUploadFormData) => {
    if (!coverFile) {
      alert('Cover image is required');
      return;
    }

    if (!hasPdf && !hasAudio) {
      alert('At least one format (PDF or Audio) is required');
      return;
    }

    if (hasPdf && !pdfFile) {
      alert('PDF file is required');
      return;
    }

    if (hasAudio && !audioFile) {
      alert('Audio file is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.description) formData.append('description', data.description);
    formData.append('language', data.language);
    if (data.publication_date) formData.append('publication_date', data.publication_date);
    formData.append('genre_id', data.genre_id);
    formData.append('cover', coverFile);
    
    if (data.publisher_id) {
      formData.append('publisher_user_id', data.publisher_id);
    } else if (data.publisher_name) {
      formData.append('publisher_name', data.publisher_name);
    }
    
    if (hasPdf && pdfFile) {
      formData.append('pdf', pdfFile);
      formData.append('pdf_price', String(data.pdf_price || 0));
      if (data.pdf_page_count) formData.append('pdf_page_count', String(data.pdf_page_count));
    }
    
    if (hasAudio && audioFile) {
      formData.append('audio', audioFile);
      formData.append('audio_price', String(data.audio_price || 0));
      if (data.audio_duration_sec) formData.append('audio_duration_sec', String(data.audio_duration_sec));
    }

    await uploadBook(formData);
  };

  const handlePublisherSearch = (value: string) => {
    setPublisherSearchTerm(value);
    search(value);
    setValue('publisher_id', '');
    setValue('publisher_name', '');
  };

  const selectPublisher = (publisher: { id: string; name: string }) => {
    setValue('publisher_id', publisher.id);
    setValue('publisher_name', publisher.name);
    setPublisherSearchTerm(publisher.name);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Upload New Book</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
          <button type="button" onClick={clearError} className="ml-2 text-sm underline">Dismiss</button>
        </div>
      )}
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            {...register('title')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input
            {...register('subtitle')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Language *</label>
            <select
              {...register('language')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Amharic">አማርኛ (Amharic)</option>
              <option value="French">Français</option>
              <option value="Arabic">العربية</option>
              <option value="Spanish">Español</option>
            </select>
            {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Publication Date</label>
            <input
              type="date"
              {...register('publication_date')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Genre *</label>
          <select
            {...register('genre_id')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
          {errors.genre_id && <p className="text-red-500 text-sm mt-1">{errors.genre_id.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Author Name</label>
          <input
            value={user?.publicName || ''}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Using your profile name</p>
        </div>
        
        {/* Publisher Selection */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Publisher Name (Optional)</label>
          <input
            type="text"
            value={publisherSearchTerm}
            onChange={(e) => handlePublisherSearch(e.target.value)}
            placeholder="Search for existing publisher or enter new name..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && <p className="text-xs text-gray-400 mt-1">Searching...</p>}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
              {suggestions.map((pub) => (
                <button
                  key={pub.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => selectPublisher(pub)}
                >
                  {pub.name}
                </button>
              ))}
            </div>
          )}
          {selectedPublisherId && (
            <p className="text-xs text-green-600 mt-1">✓ Linked to existing publisher</p>
          )}
          {!selectedPublisherId && publisherSearchTerm && !showSuggestions && (
            <p className="text-xs text-gray-500 mt-1">Will create new publisher: "{publisherSearchTerm}"</p>
          )}
        </div>
      </div>
      
      {/* Cover Image */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Cover Image *</h2>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full"
        />
        <p className="text-xs text-gray-500">JPEG, PNG, or WEBP. Max 5MB.</p>
      </div>
      
      {/* Formats */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Formats (at least one required)</h2>
        
        {/* PDF Format */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPdf}
              onChange={(e) => setHasPdf(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-medium">PDF Format</span>
          </label>
          
          {hasPdf && (
            <div className="mt-4 space-y-3 ml-6">
              <div>
                <label className="block text-sm font-medium mb-1">PDF File *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('pdf_price', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.pdf_price && <p className="text-red-500 text-sm">{errors.pdf_price.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Page Count *</label>
                  <input
                    type="number"
                    {...register('pdf_page_count', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.pdf_page_count && <p className="text-red-500 text-sm">{errors.pdf_page_count.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Audio Format */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAudio}
              onChange={(e) => setHasAudio(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-medium">Audio Format</span>
          </label>
          
          {hasAudio && (
            <div className="mt-4 space-y-3 ml-6">
              <div>
                <label className="block text-sm font-medium mb-1">Audio File *</label>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">MP3, WAV, or M4A. Max 200MB.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('audio_price', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.audio_price && <p className="text-red-500 text-sm">{errors.audio_price.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (seconds) *</label>
                  <input
                    type="number"
                    {...register('audio_duration_sec', { valueAsNumber: true })}
                    placeholder="e.g., 7200 for 2 hours"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.audio_duration_sec && <p className="text-red-500 text-sm">{errors.audio_duration_sec.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Uploading...' : 'Upload Book'}
      </button>
    </form>
  );
}