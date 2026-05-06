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
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [hasPdf, setHasPdf] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [publisherSearchTerm, setPublisherSearchTerm] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<BookUploadFormData>({
    resolver: zodResolver(bookUploadSchema),
    defaultValues: {
      language: 'English',
      publication_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedPublisherId = watch('publisher_id');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

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
    } else if (publisherSearchTerm.trim()) {
      formData.append('publisher_name', publisherSearchTerm.trim());
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

    const success = await uploadBook(formData);
    if (success) {
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        reset();
        setCoverFile(null);
        setCoverPreview(null);
        setPdfFile(null);
        setAudioFile(null);
        setHasPdf(false);
        setHasAudio(false);
        setPublisherSearchTerm('');
      }, 2000);
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#1A2A3A]">Upload New Book</h1>
        <p className="text-[#4A5568] text-sm mt-1">Share your work with the world</p>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="text-green-800 font-medium">Book uploaded successfully!</p>
            <p className="text-green-700 text-sm">It will appear in your library once approved.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={20} className="text-red-600" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Upload failed</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button type="button" onClick={clearError} className="text-red-600 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Basic Information Section */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-[#1A2A3A]">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Title *</label>
            <input
              {...register('title')}
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
              placeholder="Enter book title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Subtitle</label>
            <input
              {...register('subtitle')}
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
              placeholder="Optional subtitle"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all resize-none"
              placeholder="Describe your book..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Language *</label>
            <select
              {...register('language')}
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all bg-white"
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
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Publication Date</label>
            <input
              type="date"
              {...register('publication_date')}
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Genre *</label>
            <select
              {...register('genre_id')}
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all bg-white"
            >
              <option value="">Select Genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            {errors.genre_id && <p className="text-red-500 text-sm mt-1">{errors.genre_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Author Name</label>
            <input
              value={user?.publicName || ''}
              disabled
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg bg-[#F5F1EB] text-[#4A5568]"
            />
            <p className="text-xs text-[#4A5568] mt-1">Using your profile name</p>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Publisher (Optional)</label>
            <input
              type="text"
              value={publisherSearchTerm}
              onChange={(e) => handlePublisherSearch(e.target.value)}
              placeholder="Search for existing publisher or enter new name..."
              className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
            />
            {isSearching && (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 size={14} className="animate-spin text-[#B85C38]" />
                <p className="text-xs text-[#4A5568]">Searching...</p>
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-[#E8E2D9] rounded-lg shadow-lg mt-1 max-h-48 overflow-auto">
                {suggestions.map((pub) => (
                  <button
                    key={pub.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F5F1EB] transition-colors text-[#1A2A3A]"
                    onClick={() => selectPublisher(pub)}
                  >
                    {pub.name}
                  </button>
                ))}
              </div>
            )}
            {selectedPublisherId && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> Linked to existing publisher
              </p>
            )}
            {!selectedPublisherId && publisherSearchTerm && !showSuggestions && publisherSearchTerm.length > 2 && (
              <p className="text-xs text-[#4A5568] mt-1">Will create new publisher: "{publisherSearchTerm}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1A2A3A]">Cover Image *</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {coverPreview ? (
            <div className="relative w-32 h-40 rounded-lg overflow-hidden border border-[#E8E2D9]">
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed border-[#E8E2D9] rounded-lg cursor-pointer hover:border-[#B85C38] transition-colors bg-[#FDFBF7]">
              <Upload size={24} className="text-[#4A5568]" />
              <span className="text-xs text-[#4A5568] mt-1">Upload</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-[#4A5568]">JPEG, PNG, or WEBP. Max 5MB.</p>
            <p className="text-xs text-[#4A5568] mt-1">Recommended size: 1200 x 1800 pixels</p>
          </div>
        </div>
      </div>

      {/* Formats Section */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-[#1A2A3A]">Formats (at least one required)</h2>
        
        {/* PDF Format */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
          <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FDFBF7] transition-colors">
            <input
              type="checkbox"
              checked={hasPdf}
              onChange={(e) => setHasPdf(e.target.checked)}
              className="w-4 h-4 rounded border-[#E8E2D9] text-[#B85C38] focus:ring-[#B85C38]"
            />
            <span className="font-medium text-[#1A2A3A]">📖 PDF Format</span>
          </label>

          {hasPdf && (
            <div className="border-t border-[#E8E2D9] p-4 space-y-4 bg-[#FDFBF7]">
              <div>
                <label className="block text-sm font-medium text-[#1A2A3A] mb-1">PDF File *</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-[#E8E2D9] rounded-lg cursor-pointer hover:border-[#B85C38] transition-colors bg-white">
                    <Upload size={16} className="text-[#4A5568]" />
                    <span className="text-sm text-[#4A5568]">{pdfFile ? pdfFile.name : 'Choose PDF file'}</span>
                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {pdfFile && (
                    <button type="button" onClick={() => setPdfFile(null)} className="text-red-500 hover:text-red-600">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('pdf_price', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="0.00"
                  />
                  {errors.pdf_price && <p className="text-red-500 text-sm mt-1">{errors.pdf_price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Page Count *</label>
                  <input
                    type="number"
                    {...register('pdf_page_count', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="Number of pages"
                  />
                  {errors.pdf_page_count && <p className="text-red-500 text-sm mt-1">{errors.pdf_page_count.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Format */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
          <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FDFBF7] transition-colors">
            <input
              type="checkbox"
              checked={hasAudio}
              onChange={(e) => setHasAudio(e.target.checked)}
              className="w-4 h-4 rounded border-[#E8E2D9] text-[#B85C38] focus:ring-[#B85C38]"
            />
            <span className="font-medium text-[#1A2A3A]">🎧 Audio Format</span>
          </label>

          {hasAudio && (
            <div className="border-t border-[#E8E2D9] p-4 space-y-4 bg-[#FDFBF7]">
              <div>
                <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Audio File *</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-[#E8E2D9] rounded-lg cursor-pointer hover:border-[#B85C38] transition-colors bg-white">
                    <Upload size={16} className="text-[#4A5568]" />
                    <span className="text-sm text-[#4A5568]">{audioFile ? audioFile.name : 'Choose audio file'}</span>
                    <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {audioFile && (
                    <button type="button" onClick={() => setAudioFile(null)} className="text-red-500 hover:text-red-600">
                      <X size={18} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#4A5568] mt-1">MP3, WAV, or M4A. Max 200MB.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('audio_price', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="0.00"
                  />
                  {errors.audio_price && <p className="text-red-500 text-sm mt-1">{errors.audio_price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Duration (seconds) *</label>
                  <input
                    type="number"
                    {...register('audio_duration_sec', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="e.g., 7200 for 2 hours"
                  />
                  {errors.audio_duration_sec && <p className="text-red-500 text-sm mt-1">{errors.audio_duration_sec.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload Book
          </>
        )}
      </button>
    </form>
  );
}