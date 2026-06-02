'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useGenres, useLanguages } from '@/features/books/hooks/useBooks';
import { useBookUpload } from '../hooks/useBookUpload';
import { useBookForEdit } from '../hooks/useBookForEdit';
import { usePublisherSearch } from '../hooks/usePublisherSearch';
import { AddFormatPanel } from './AddFormatPanel';
import { StudioFilePreview } from './StudioFilePreview';
import { useToast, AlertDialog } from '@/components/feedback';
import { ConflictError } from '@repo/api-client';
import type { Genre } from '@repo/types';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';

const bookUploadSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  language: z.string().optional(),
  publication_date: z.string().optional(),
  genre_id: z.string().optional(),
  publisher_id: z.string().optional(),
  pdf_price: z.number().min(0, 'Price must be 0 or greater').optional(),
  audio_price: z.number().min(0, 'Price must be 0 or greater').optional(),
});

type BookUploadFormData = z.infer<typeof bookUploadSchema>;

export function AuthorBookUploadForm({ bookId }: { bookId?: string } = {}) {
  const { user } = useAuthStore();
  const { data: genresData } = useGenres();
  const { data: languagesData } = useLanguages();
  const genres = (genresData as Genre[]) || [];
  const languages = (languagesData as string[]) || [];
  const { showToast } = useToast();
  const { uploadBook, updateUploadedBook, isSubmitting, error, clearError } = useBookUpload({
    onError: (msg) => showToast(msg, 'error'),
  });
  const { data: editBook, isLoading: isEditLoading, refetch: refetchEditBook } = useBookForEdit(bookId);
  const { suggestions, showSuggestions, search, setShowSuggestions, isLoading: isSearching } = usePublisherSearch();
  const isEditMode = !!bookId;
  const isApprovedEdit = isEditMode && editBook?.status === 'approved';
  const existingPdf = editBook?.formats?.find((f) => f.format_type === 'PDF');
  const existingAudio = editBook?.formats?.find((f) => f.format_type === 'Audio');
  const showRegularPdfUploader = !isEditMode || !existingPdf || isApprovedEdit;
  const showRegularAudioUploader = !isEditMode || !existingAudio || isApprovedEdit;
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [hasPdf, setHasPdf] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [detectedPdfPages, setDetectedPdfPages] = useState<number | null>(null);
  const [detectedAudioSeconds, setDetectedAudioSeconds] = useState<number | null>(null);
  const [publisherSearchTerm, setPublisherSearchTerm] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeAction, setActiveAction] = useState<'draft' | 'submit' | null>(null);
  const [duplicateBookId, setDuplicateBookId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<BookUploadFormData>({
    resolver: zodResolver(bookUploadSchema),
    defaultValues: {
      language: undefined,
      publication_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedPublisherId = watch('publisher_id');

  useEffect(() => {
    if (!hasPdf) {
      setPdfFile(null);
      setDetectedPdfPages(null);
      setValue('pdf_price', undefined);
    }
  }, [hasPdf, setValue]);

  useEffect(() => {
    if (!hasAudio) {
      setAudioFile(null);
      setDetectedAudioSeconds(null);
      setValue('audio_price', undefined);
    }
  }, [hasAudio, setValue]);

  useEffect(() => {
    if (!editBook) return;
    reset({
      title: editBook.title,
      subtitle: editBook.subtitle || '',
      description: editBook.description || '',
      language: editBook.language,
      publication_date: editBook.publication_date
        ? String(editBook.publication_date).slice(0, 10)
        : new Date().toISOString().split('T')[0],
      genre_id: editBook.genre_id || editBook.genre?.id || '',
      publisher_id: editBook.publisher_user_id || '',
    });
    if (editBook.cover_image_url) setCoverPreview(editBook.cover_image_url);
    if (existingPdf) {
      setHasPdf(true);
      setValue('pdf_price', existingPdf.price);
      if (existingPdf.page_count) setDetectedPdfPages(existingPdf.page_count);
    }
    if (existingAudio) {
      setHasAudio(true);
      setValue('audio_price', existingAudio.price);
      if (existingAudio.duration_sec) setDetectedAudioSeconds(existingAudio.duration_sec);
    }
    if (editBook.publisher_name && !editBook.publisher_user_id) {
      setPublisherSearchTerm(editBook.publisher_name);
    }
  }, [editBook, existingPdf, existingAudio, reset, setValue]);

  const persistForm = async (formData: FormData) => {
    if (isEditMode && bookId) {
      return updateUploadedBook(bookId, formData);
    }
    return uploadBook(formData);
  };

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
    setActiveAction('submit');
    if (!data.title || !data.title.trim()) {
      showToast('Title is required', 'error');
      setActiveAction(null);
      return;
    }
    const hasAnyFormat = (hasPdf && (pdfFile || existingPdf)) || (hasAudio && (audioFile || existingAudio));
    if (!hasAnyFormat) {
      showToast('At least one format (PDF or Audio) is required', 'error');
      setActiveAction(null);
      return;
    }

    if (hasPdf && !pdfFile && !existingPdf) {
      showToast('PDF file is required', 'error');
      setActiveAction(null);
      return;
    }

    if (hasAudio && !audioFile && !existingAudio) {
      showToast('Audio file is required', 'error');
      setActiveAction(null);
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title.trim());
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.description) formData.append('description', data.description);
    if (data.language) formData.append('language', data.language);
    if (data.publication_date) formData.append('publication_date', data.publication_date);
    if (data.genre_id) formData.append('genre_id', data.genre_id);
    if (coverFile) formData.append('cover', coverFile);
    
    if (data.publisher_id) {
      formData.append('publisher_user_id', data.publisher_id);
    } else if (publisherSearchTerm.trim()) {
      formData.append('publisher_name', publisherSearchTerm.trim());
    }

    formData.append('submit_for_review', 'true');
    
    if (hasPdf && pdfFile) {
      formData.append('pdf', pdfFile);
      formData.append('pdf_price', String(data.pdf_price || 0));
    } else if (hasPdf && existingPdf) {
      formData.append('pdf_price', String(data.pdf_price ?? existingPdf.price));
    }
    
    if (hasAudio && audioFile) {
      formData.append('audio', audioFile);
      formData.append('audio_price', String(data.audio_price || 0));
    } else if (hasAudio && existingAudio) {
      formData.append('audio_price', String(data.audio_price ?? existingAudio.price));
    }

    try {
      await persistForm(formData);
      setUploadSuccess(true);
      showToast(isEditMode ? 'Book updated and submitted' : 'Book submitted for review', 'success');
      if (!isEditMode) {
        setTimeout(() => {
          setUploadSuccess(false);
          setActiveAction(null);
          reset();
          setCoverFile(null);
          setCoverPreview(null);
          setPdfFile(null);
          setAudioFile(null);
          setHasPdf(false);
          setHasAudio(false);
          setPublisherSearchTerm('');
        }, 2000);
      } else {
        setActiveAction(null);
      }
    } catch (err) {
      if (err instanceof ConflictError && err.existingBookId) {
        setDuplicateBookId(err.existingBookId);
      }
      setActiveAction(null);
    }
  };

  const onSaveDraft = async (data: BookUploadFormData) => {
    setActiveAction('draft');
    const hasAnyInput =
      !!data.title?.trim() ||
      !!data.subtitle?.trim() ||
      !!data.description?.trim() ||
      !!data.language?.trim() ||
      !!data.genre_id?.trim() ||
      !!coverFile ||
      !!pdfFile ||
      !!audioFile ||
      !!data.publisher_id?.trim() ||
      !!publisherSearchTerm.trim();

    if (!hasAnyInput) {
      showToast('Enter at least one field to save a draft', 'error');
      setActiveAction(null);
      return;
    }

    const formData = new FormData();
    if (data.title?.trim()) formData.append('title', data.title.trim());
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.description) formData.append('description', data.description);
    if (data.language) formData.append('language', data.language);
    if (data.publication_date) formData.append('publication_date', data.publication_date);
    if (data.genre_id) formData.append('genre_id', data.genre_id);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('save_as_draft', 'true');

    // Optional publisher link while drafting
    if (data.publisher_id) {
      formData.append('publisher_user_id', data.publisher_id);
    } else if (publisherSearchTerm.trim()) {
      formData.append('publisher_name', publisherSearchTerm.trim());
    }

    // Formats are optional for drafts
    if (hasPdf && pdfFile) {
      formData.append('pdf', pdfFile);
      formData.append('pdf_price', String(data.pdf_price || 0));
    } else if (hasPdf && existingPdf) {
      formData.append('pdf_price', String(data.pdf_price ?? existingPdf.price));
    }

    if (hasAudio && audioFile) {
      formData.append('audio', audioFile);
      formData.append('audio_price', String(data.audio_price || 0));
    } else if (hasAudio && existingAudio) {
      formData.append('audio_price', String(data.audio_price ?? existingAudio.price));
    }

    try {
      await persistForm(formData);
      setUploadSuccess(true);
      showToast(isEditMode ? 'Changes saved' : 'Draft saved', 'success');
      if (isEditMode) {
        refetchEditBook();
        setActiveAction(null);
      } else {
        setTimeout(() => {
          setUploadSuccess(false);
          setActiveAction(null);
          reset();
          setCoverFile(null);
          setCoverPreview(null);
          setPdfFile(null);
          setAudioFile(null);
          setHasPdf(false);
          setHasAudio(false);
          setDetectedPdfPages(null);
          setDetectedAudioSeconds(null);
          setPublisherSearchTerm('');
        }, 2000);
      }
    } catch (err) {
      if (err instanceof ConflictError && err.existingBookId) {
        setDuplicateBookId(err.existingBookId);
      }
      setActiveAction(null);
    }
  };

  useEffect(() => {
    // Configure pdf.js worker (bundled)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(pdfjsLib as any).GlobalWorkerOptions?.workerSrc) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    }
  }, []);

  const handlePdfChange = async (file: File | null) => {
    setPdfFile(file);
    setDetectedPdfPages(null);
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = await (pdfjsLib as any).getDocument({ data: buf }).promise;
      setDetectedPdfPages(doc.numPages || null);
    } catch {
      setDetectedPdfPages(null);
    }
  };

  const handleAudioChange = async (file: File | null) => {
    setAudioFile(file);
    setDetectedAudioSeconds(null);
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = url;
      audio.onloadedmetadata = () => {
        const d = audio.duration;
        URL.revokeObjectURL(url);
        if (typeof d === 'number' && Number.isFinite(d)) setDetectedAudioSeconds(Math.max(1, Math.round(d)));
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setDetectedAudioSeconds(null);
      };
    } catch {
      setDetectedAudioSeconds(null);
    }
  };

  const handlePublisherSearch = (value: string) => {
    setPublisherSearchTerm(value);
    search(value);
    setValue('publisher_id', '');
  };

  const selectPublisher = (publisher: { id: string; name: string }) => {
    setValue('publisher_id', publisher.id);
    setPublisherSearchTerm(publisher.name);
    setShowSuggestions(false);
  };

  if (isEditMode && isEditLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[#B85C38]" size={32} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#1A2A3A]">
          {isEditMode ? 'Edit Book' : 'Upload New Book'}
        </h1>
        <p className="text-[#4A5568] text-sm mt-1">
          {isEditMode ? 'Update your book details and formats' : 'Share your work with the world'}
        </p>
        {isEditMode && bookId && editBook && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            <Link
              href={`/studio/books/${bookId}`}
              className="text-sm font-medium text-[#B85C38] hover:text-[#8E735B] hover:underline"
            >
              View book preview
            </Link>
            {editBook.status === 'approved' && (
              <Link
                href={`/market/${bookId}`}
                className="text-sm font-medium text-[#B85C38] hover:text-[#8E735B] hover:underline"
              >
                Open in marketplace
              </Link>
            )}
          </div>
        )}
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
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
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

        {isApprovedEdit && existingPdf && (
          <p className="text-sm text-[#4A5568] bg-[#F5F1EB] rounded-lg px-3 py-2">
            Current PDF: {existingPdf.price} ETB · {existingPdf.page_count} pages ·{' '}
            {existingPdf.is_active === false ? 'Pending approval' : 'Active'}. Upload a new PDF
            below to replace the file (changes require admin review).
          </p>
        )}
        {isApprovedEdit && existingAudio && (
          <p className="text-sm text-[#4A5568] bg-[#F5F1EB] rounded-lg px-3 py-2">
            Current audio: {existingAudio.price} ETB ·{' '}
            {existingAudio.is_active === false ? 'Pending approval' : 'Active'}. Upload a new
            audio file below to replace it (changes require admin review).
          </p>
        )}

        {isApprovedEdit && bookId && !existingPdf && (
          <AddFormatPanel bookId={bookId} formatType="PDF" onAdded={() => refetchEditBook()} />
        )}
        {isApprovedEdit && bookId && !existingAudio && (
          <AddFormatPanel bookId={bookId} formatType="Audio" onAdded={() => refetchEditBook()} />
        )}
        
        {/* PDF Format */}
        {showRegularPdfUploader && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
          <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FDFBF7] transition-colors">
            <input
              type="checkbox"
              checked={hasPdf}
              disabled={!!existingPdf && !isApprovedEdit}
              onChange={(e) => setHasPdf(e.target.checked)}
              className="w-4 h-4 rounded border-[#E8E2D9] text-[#B85C38] focus:ring-[#B85C38] disabled:opacity-50"
            />
            <span className="font-medium text-[#1A2A3A]">📖 PDF Format</span>
          </label>

          {hasPdf && (
            <div className="border-t border-[#E8E2D9] p-4 space-y-4 bg-[#FDFBF7]">
              <div>
                <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                  PDF File {existingPdf ? '(optional — replace)' : '*'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-[#E8E2D9] rounded-lg cursor-pointer hover:border-[#B85C38] transition-colors bg-white">
                    <Upload size={16} className="text-[#4A5568]" />
                    <span className="text-sm text-[#4A5568]">{pdfFile ? pdfFile.name : 'Choose PDF file'}</span>
                    <input type="file" accept="application/pdf" onChange={(e) => handlePdfChange(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {pdfFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setHasPdf(false);
                        handlePdfChange(null);
                        setValue('pdf_price', undefined);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
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
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Page Count</label>
                  <div className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg bg-white text-sm text-[#4A5568]">
                    {detectedPdfPages ? `${detectedPdfPages} pages` : 'Auto-detected from PDF'}
                  </div>
                </div>
              </div>

              {(pdfFile || (existingPdf?.storage_path && existingPdf.id)) && (
                <StudioFilePreview
                  formatType="PDF"
                  file={pdfFile}
                  formatId={!pdfFile && existingPdf?.storage_path ? existingPdf.id : undefined}
                />
              )}
            </div>
          )}
        </div>
        )}

        {/* Audio Format */}
        {showRegularAudioUploader && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
          <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FDFBF7] transition-colors">
            <input
              type="checkbox"
              checked={hasAudio}
              disabled={!!existingAudio && !isApprovedEdit}
              onChange={(e) => setHasAudio(e.target.checked)}
              className="w-4 h-4 rounded border-[#E8E2D9] text-[#B85C38] focus:ring-[#B85C38] disabled:opacity-50"
            />
            <span className="font-medium text-[#1A2A3A]">🎧 Audio Format</span>
          </label>

          {hasAudio && (
            <div className="border-t border-[#E8E2D9] p-4 space-y-4 bg-[#FDFBF7]">
              <div>
                <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                  Audio File {existingAudio ? '(optional — replace)' : '*'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-[#E8E2D9] rounded-lg cursor-pointer hover:border-[#B85C38] transition-colors bg-white">
                    <Upload size={16} className="text-[#4A5568]" />
                    <span className="text-sm text-[#4A5568]">{audioFile ? audioFile.name : 'Choose audio file'}</span>
                    <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a" onChange={(e) => handleAudioChange(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {audioFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setHasAudio(false);
                        handleAudioChange(null);
                        setValue('audio_price', undefined);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
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
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Duration</label>
                  <div className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-lg bg-white text-sm text-[#4A5568]">
                    {detectedAudioSeconds ? `${detectedAudioSeconds} sec` : 'Auto-detected from audio'}
                  </div>
                </div>
              </div>

              {(audioFile || (existingAudio?.storage_path && existingAudio.id)) && (
                <StudioFilePreview
                  formatType="Audio"
                  file={audioFile}
                  formatId={!audioFile && existingAudio?.storage_path ? existingAudio.id : undefined}
                />
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleSubmit(onSaveDraft)}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-white border border-[#E8E2D9] text-[#1A2A3A] rounded-lg font-medium hover:bg-[#FDFBF7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && activeAction === 'draft' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>{isEditMode ? 'Save Changes' : 'Save Draft'}</>
          )}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && activeAction === 'submit' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isEditMode ? 'Saving...' : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload size={18} />
              {isEditMode ? 'Save & Submit for Review' : 'Submit for Review'}
            </>
          )}
        </button>
      </div>

      <AlertDialog
        open={!!duplicateBookId}
        title="This book already exists"
        message={
          'You already have a book with this title and language.\n\n' +
          'To add PDF or Audio, open your existing book and use Add format on the edit page. ' +
          'You cannot upload the same title and language again for a different format only.'
        }
        actionHref={duplicateBookId ? `/studio/books/${duplicateBookId}/edit` : undefined}
        actionLabel="Edit existing book"
        buttonLabel="Close"
        onClose={() => setDuplicateBookId(null)}
      />
    </form>
  );
}