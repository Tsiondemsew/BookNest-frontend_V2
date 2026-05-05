// 'use client';

// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/stores/authStore';
// import { useGenres } from '@/features/books/hooks/useBooks';
// import { apiClient } from '@/lib/api/client';

// // Types for suggestions
// interface Suggestion {
//   id: string;
//   name: string;
//   email?: string;
// }

// interface SuggestionsResponse {
//   success: boolean;
//   data: Suggestion[];
// }

// // Form validation schema
// const bookUploadSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   subtitle: z.string().optional(),
//   description: z.string().optional(),
//   language: z.string().min(1, 'Language is required'),
//   publication_date: z.string().optional(),
//   genre_id: z.string().min(1, 'Genre is required'),
//   author_name: z.string().optional(),
//   author_user_id: z.string().optional(),
//   publisher_name: z.string().optional(),
//   publisher_user_id: z.string().optional(),
//   pdf_price: z.number().min(0, 'Price must be 0 or greater').optional(),
//   pdf_page_count: z.number().min(1, 'Page count is required for PDF').optional(),
//   audio_price: z.number().min(0, 'Price must be 0 or greater').optional(),
//   audio_duration_sec: z.number().min(1, 'Duration is required for Audio').optional(),
// });

// type BookUploadFormData = z.infer<typeof bookUploadSchema>;

// export function BookUploadForm() {
//   const router = useRouter();
//   const { user } = useAuthStore();
//   const { data: genresData } = useGenres();
//   const genres = genresData || [];
  
//   // File states
//   const [coverFile, setCoverFile] = useState<File | null>(null);
//   const [pdfFile, setPdfFile] = useState<File | null>(null);
//   const [audioFile, setAudioFile] = useState<File | null>(null);
  
//   // UI states
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [hasPdf, setHasPdf] = useState(false);
//   const [hasAudio, setHasAudio] = useState(false);
  
//   // Suggestion states
//   const [authorSuggestions, setAuthorSuggestions] = useState<Suggestion[]>([]);
//   const [publisherSuggestions, setPublisherSuggestions] = useState<Suggestion[]>([]);
//   const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);
//   const [showPublisherSuggestions, setShowPublisherSuggestions] = useState(false);
//   const [customAuthorName, setCustomAuthorName] = useState('');
//   const [customPublisherName, setCustomPublisherName] = useState('');

//   const isAuthor = user?.role === 'author';
//   const isPublisher = user?.role === 'publisher';

//   const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BookUploadFormData>({
//     resolver: zodResolver(bookUploadSchema),
//     defaultValues: {
//       language: 'English',
//       publication_date: new Date().toISOString().split('T')[0],
//       pdf_price: 0,
//       audio_price: 0,
//     },
//   });

// const fetchPublisherSuggestions = async (query: string) => {
//   if (!query || query.length < 2) {
//     setPublisherSuggestions([]);
//     setShowPublisherSuggestions(false);
//     return;
//   }
//   try {
//     const response = await apiClient.get<SuggestionsResponse>(`/api/auth/suggest?role=publisher&q=${query}`);
//     setPublisherSuggestions(response.data || []);
//     setShowPublisherSuggestions(true);
//   } catch (err) {
//     console.error('Failed to fetch publisher suggestions', err);
//     setPublisherSuggestions([]);
//     setShowPublisherSuggestions(false);
//   }
// };

// const fetchAuthorSuggestions = async (query: string) => {
//   if (!query || query.length < 2) {
//     setAuthorSuggestions([]);
//     setShowAuthorSuggestions(false);
//     return;
//   }
//   try {
//     const response = await apiClient.get<SuggestionsResponse>(`/api/auth/suggest?role=author&q=${query}`);
//     setAuthorSuggestions(response.data || []);
//     setShowAuthorSuggestions(true);
//   } catch (err) {
//     console.error('Failed to fetch author suggestions', err);
//     setAuthorSuggestions([]);
//     setShowAuthorSuggestions(false);
//   }
// };

//   const onSubmit = async (data: BookUploadFormData) => {
//     if (!coverFile) {
//       setError('Cover image is required');
//       return;
//     }

//     if (!hasPdf && !hasAudio) {
//       setError('At least one format (PDF or Audio) is required');
//       return;
//     }

//     if (hasPdf && !pdfFile) {
//       setError('PDF file is required');
//       return;
//     }

//     if (hasAudio && !audioFile) {
//       setError('Audio file is required');
//       return;
//     } 
  
//   setIsSubmitting(true);
//   setError(null);

//   const formData = new FormData();
  
//   // Append all fields
//   formData.append('title', data.title);
//   if (data.subtitle) formData.append('subtitle', data.subtitle);
//   if (data.description) formData.append('description', data.description);
//   formData.append('language', data.language);
//   if (data.publication_date) formData.append('publication_date', data.publication_date);
//   formData.append('genre_id', data.genre_id);
//   formData.append('cover', coverFile as File);
  
//   // Author/Publisher specific
//   if (isAuthor) {
//     formData.append('author_name', user?.publicName || '');
//     formData.append('author_user_id', user?.id || '');
    
//     if (data.publisher_user_id) {
//       formData.append('publisher_user_id', data.publisher_user_id);
//     } else if (customPublisherName) {
//       formData.append('publisher_name', customPublisherName);
//     } else if (data.publisher_name) {
//       formData.append('publisher_name', data.publisher_name);
//     }
//   } else if (isPublisher) {
//     formData.append('publisher_name', user?.publicName || '');
//     formData.append('publisher_user_id', user?.id || '');
    
//     if (data.author_user_id) {
//       formData.append('author_user_id', data.author_user_id);
//     } else if (customAuthorName) {
//       formData.append('author_name', customAuthorName);
//     } else if (data.author_name) {
//       formData.append('author_name', data.author_name);
//     }
//   }
  
//   // PDF format
//   if (hasPdf && pdfFile) {
//     formData.append('pdf', pdfFile as File);
//     formData.append('pdf_price', String(data.pdf_price || 0));
//     if (data.pdf_page_count) formData.append('pdf_page_count', String(data.pdf_page_count));
//   }
  
//   // Audio format
//   if (hasAudio && audioFile) {
//     formData.append('audio', audioFile as File);
//     formData.append('audio_price', String(data.audio_price || 0));
//     if (data.audio_duration_sec) formData.append('audio_duration_sec', String(data.audio_duration_sec));
//   }

//   try {
//     // Don't set Content-Type header - let browser set it with boundary
//     const response = await fetch('http://localhost:5000/api/books/upload', {
//       method: 'POST',
//       credentials: 'include',
//       body: formData,
//     });
    
//     const result = await response.json();
    
//     if (result.success) {
//       router.push('/studio/books');
//     } else {
//       setError(result.error?.message || 'Failed to upload book');
//     }
//   } catch (err: any) {
//     setError(err.message || 'Failed to upload book');
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold">Upload New Book</h1>
      
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}
      
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Basic Information</h2>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Title *</label>
//           <input
//             {...register('title')}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Subtitle</label>
//           <input
//             {...register('subtitle')}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <textarea
//             {...register('description')}
//             rows={4}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div className="grid grid-cols-2 gap-4"> 
// <div>
//   <label className="block text-sm font-medium mb-1">Language *</label>
//   <select
//     {...register('language')}
//     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//   >
//     <option value="English">English</option>
//     <option value="Amharic">አማርኛ (Amharic)</option>
//     <option value="French">Français</option>
//     <option value="Arabic">العربية</option>
//     <option value="Spanish">Español</option>
//     <option value="German">Deutsch</option>
//   </select>
//   {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}
// </div>
          
//           <div>
//             <label className="block text-sm font-medium mb-1">Publication Date</label>
//             <input
//               type="date"
//               {...register('publication_date')}
//               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Genre *</label>
//           <select
//             {...register('genre_id')}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select Genre</option>
//             {genres.map((genre) => (
//               <option key={genre.id} value={genre.id}>{genre.name}</option>
//             ))}
//           </select>
//           {errors.genre_id && <p className="text-red-500 text-sm mt-1">{errors.genre_id.message}</p>}
//         </div>
        
//         {isAuthor ? (
//           <>
//             <div>
//               <label className="block text-sm font-medium mb-1">Author Name</label>
//               <input
//                 value={user?.publicName || ''}
//                 disabled
//                 className="w-full px-3 py-2 border rounded-md bg-gray-50"
//               />
//               <p className="text-xs text-gray-500 mt-1">Using your profile name</p>
//             </div>
            
//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">Publisher Name (Optional)</label>
//               <input
//                 type="text"
//                 placeholder="Search or enter publisher name..."
//                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 onChange={(e) => {
//                   setCustomPublisherName(e.target.value);
//                   fetchPublisherSuggestions(e.target.value);
//                   setShowPublisherSuggestions(true);
//                   setValue('publisher_name', '');
//                   setValue('publisher_user_id', '');
//                 }}
//               />
//             // For publisher suggestions (when author is uploading)
// {showPublisherSuggestions && publisherSuggestions.length > 0 && (
//   <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
//     {publisherSuggestions.map((pub) => (
//       <button
//         key={pub.id}
//         type="button"
//         className="w-full text-left px-3 py-2 hover:bg-gray-100"
//         onClick={() => {
//           setValue('publisher_user_id', pub.id);
//           setValue('publisher_name', pub.name);
//           setCustomPublisherName('');
//           setShowPublisherSuggestions(false);
//         }}
//       >
//         {pub.name}
//       </button>
//     ))}
//   </div>
// )}


//               <p className="text-xs text-gray-500 mt-1">Start typing to search existing publishers, or enter new name</p>
//             </div>
//           </>
//         ) : isPublisher ? (
//           <>
//             <div>
//               <label className="block text-sm font-medium mb-1">Publisher Name</label>
//               <input
//                 value={user?.publicName || ''}
//                 disabled
//                 className="w-full px-3 py-2 border rounded-md bg-gray-50"
//               />
//               <p className="text-xs text-gray-500 mt-1">Using your profile name</p>
//             </div>
            
//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">Author Name *</label>
//               <input
//                 type="text"
//                 placeholder="Search or enter author name..."
//                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 onChange={(e) => {
//                   setCustomAuthorName(e.target.value);
//                   fetchAuthorSuggestions(e.target.value);
//                   setShowAuthorSuggestions(true);
//                   setValue('author_name', '');
//                   setValue('author_user_id', '');
//                 }}
//               />
//               // For author suggestions (when publisher is uploading)
// {showAuthorSuggestions && authorSuggestions.length > 0 && (
//   <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
//     {authorSuggestions.map((author) => (
//       <button
//         key={author.id}
//         type="button"
//         className="w-full text-left px-3 py-2 hover:bg-gray-100"
//         onClick={() => {
//           setValue('author_user_id', author.id);
//           setValue('author_name', author.name);
//           setCustomAuthorName('');
//           setShowAuthorSuggestions(false);
//         }}
//       >
//         {author.name}
//       </button>
//     ))}
//   </div>
// )}
//               <p className="text-xs text-gray-500 mt-1">Start typing to search existing authors, or enter new name</p>
//             </div>
//           </>
//         ) : null}
//       </div>
      
//       <div className="space-y-2">
//         <h2 className="text-lg font-semibold">Cover Image *</h2>
//         <input
//           type="file"
//           accept="image/jpeg,image/png,image/webp"
//           onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
//           className="w-full"
//         />
//         <p className="text-xs text-gray-500">JPEG, PNG, or WEBP. Max 5MB.</p>
//       </div>
      
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Formats (at least one required)</h2>
        
//         <div className="border rounded-lg p-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={hasPdf}
//               onChange={(e) => setHasPdf(e.target.checked)}
//               className="w-4 h-4"
//             />
//             <span className="font-medium">PDF Format</span>
//           </label>
          
//           {hasPdf && (
//             <div className="mt-4 space-y-3 ml-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">PDF File *</label>
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
//                   className="w-full"
//                 />
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Price (ETB) *</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     {...register('pdf_price', { valueAsNumber: true })}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Page Count *</label>
//                   <input
//                     type="number"
//                     {...register('pdf_page_count', { valueAsNumber: true })}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
        
//         <div className="border rounded-lg p-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={hasAudio}
//               onChange={(e) => setHasAudio(e.target.checked)}
//               className="w-4 h-4"
//             />
//             <span className="font-medium">Audio Format</span>
//           </label>
          
//           {hasAudio && (
//             <div className="mt-4 space-y-3 ml-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Audio File *</label>
//                 <input
//                   type="file"
//                   accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a"
//                   onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
//                   className="w-full"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">MP3, WAV, or M4A. Max 200MB.</p>
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Price (ETB) *</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     {...register('audio_price', { valueAsNumber: true })}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Duration (seconds) *</label>
//                   <input
//                     type="number"
//                     {...register('audio_duration_sec', { valueAsNumber: true })}
//                     placeholder="e.g., 7200 for 2 hours"
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
//       >
//         {isSubmitting ? 'Uploading...' : 'Upload Book'}
//       </button>
//     </form>
//   );
// }