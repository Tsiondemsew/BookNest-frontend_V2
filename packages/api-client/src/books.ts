import type {
  BooksResponse,
  PersonalizedBooksResponse,
  BookPurchaseStatusResponse,
  BookResponse,
  GenresResponse,
  CreateBookRequest,
  CreateBookResponse,
  UpdateBookRequest,
  UpdateBookResponse,
  DeleteBookResponse,
  MyBooksResponse,
  Book,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export interface GetBooksParams {
  genre?: string;
  format?: 'PDF' | 'Audio';
  search?: string;
  page?: number;
  limit?: number;
}


export function createBooksApi(client: ApiClient) {
  return {
    // Existing methods
    getBooks: (params?: GetBooksParams) => {
  const searchParams = new URLSearchParams();
  if (params?.genre && params.genre !== 'all') searchParams.append('genre', params.genre);
  if (params?.format) searchParams.append('format', params.format);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  
  const url = searchParams.toString() 
    ? `${endpoints.books.list}?${searchParams.toString()}`
    : endpoints.books.list;
  
  return client.get<BooksResponse>(url);
},
    
    getBookById: (id: string) => 
      client.get<BookResponse>(endpoints.books.detail(id)),
    
    getGenres: () => 
      client.get<GenresResponse>(endpoints.books.genres),

    getPurchaseStatus: (bookId: string) =>
      client.get<BookPurchaseStatusResponse>(
        `/api/payments/purchase-status?book_id=${encodeURIComponent(bookId)}`
      ),

    getPersonalizedBooks: (limit?: number) => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', String(limit));
      const url = params.toString()
        ? `${endpoints.books.personalized}?${params.toString()}`
        : endpoints.books.personalized;
      return client.get<PersonalizedBooksResponse>(url);
    },

    getLanguages: () =>
      client.get<{ success: boolean; data: string[] }>(endpoints.books.languages),

    // Create book
    createBook: (data: CreateBookRequest) =>
      client.post<CreateBookResponse, CreateBookRequest>(endpoints.books.list, data),

    // Update book
    updateBook: (id: string, data: UpdateBookRequest) =>
      client.put<UpdateBookResponse, UpdateBookRequest>(endpoints.books.detail(id), data),

    // Delete book
    deleteBook: (id: string) =>
      client.delete<DeleteBookResponse>(endpoints.books.detail(id)),

    // Get my books
    getMyBooks: (page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString() 
        ? `${endpoints.books.myBooks}?${params.toString()}`
        : endpoints.books.myBooks;
      return client.get<MyBooksResponse>(url);
    },

    uploadBook: (formData: FormData) =>
      client.post<{ success: boolean; data: Book; error?: { message?: string } }, FormData>(
        endpoints.books.upload,
        formData
      ),

    submitBookForReview: (bookId: string) =>
      client.post<{ success: boolean; data: Book; error?: { message?: string } }, undefined>(
        endpoints.books.submit(bookId),
        undefined as any
      ),

    getBookForEdit: (id: string) =>
      client.get<BookResponse>(endpoints.books.edit(id)),

    updateUploadedBook: (id: string, formData: FormData) =>
      client.put<{ success: boolean; data: Book; error?: { message?: string } }, FormData>(
        endpoints.books.updateUpload(id),
        formData
      ),

    addBookFormat: (id: string, formData: FormData) =>
      client.post<{ success: boolean; data: Book; error?: { message?: string } }, FormData>(
        endpoints.books.addFormat(id),
        formData
      ),

    // Update book cover - using PUT instead of PATCH
    updateBookCover: (id: string, coverImagePath: string, coverImageUrl: string) =>
      client.put<{ success: boolean; message: string }>(
        `${endpoints.books.detail(id)}/cover`,
        {
          cover_image_path: coverImagePath,
          cover_image_url: coverImageUrl,
        }
      ),
  };
}