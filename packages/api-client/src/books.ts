import type {
  BooksResponse,
  BookResponse,
  GenresResponse,
  CreateBookRequest,
  CreateBookResponse,
  UpdateBookRequest,
  UpdateBookResponse,
  DeleteBookResponse,
  MyBooksResponse,
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
      if (params?.genre) searchParams.append('genre', params.genre);
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