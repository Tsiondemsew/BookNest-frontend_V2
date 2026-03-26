import type { Book, User, Review } from '@repo/types';

/**
 * Full-text search implementation for books, users, and reviews
 * Supports fuzzy matching and filtering
 */

interface SearchOptions {
  caseSensitive?: boolean;
  fuzzy?: boolean;
  limit?: number;
}

/**
 * Simple fuzzy matching algorithm
 */
export function fuzzyMatch(query: string, text: string, caseSensitive = false): boolean {
  const q = caseSensitive ? query : query.toLowerCase();
  const t = caseSensitive ? text : text.toLowerCase();

  let qIdx = 0;
  let tIdx = 0;

  while (qIdx < q.length && tIdx < t.length) {
    if (q[qIdx] === t[tIdx]) {
      qIdx++;
    }
    tIdx++;
  }

  return qIdx === q.length;
}

/**
 * Calculate relevance score for search results
 */
function getRelevanceScore(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 90;

  // Contains query
  if (lowerText.includes(lowerQuery)) return 70;

  // Fuzzy match
  if (fuzzyMatch(query, lowerText)) return 50;

  return 0;
}

/**
 * Search books by title, author, or description
 */
export function searchBooks(
  books: Book[],
  query: string,
  options: SearchOptions = {}
): Array<Book & { relevance: number }> {
  const { caseSensitive = false, fuzzy = true, limit = 50 } = options;

  if (!query.trim()) return [];

  const results = books
    .map((book) => {
      const titleScore = getRelevanceScore(query, book.title);
      const authorScore = getRelevanceScore(query, book.author);
      const descScore = getRelevanceScore(query, book.description || '');

      const relevance = Math.max(titleScore, authorScore, descScore);

      // Additional boost for fuzzy matches if enabled
      if (fuzzy && relevance === 0 && fuzzyMatch(query, `${book.title} ${book.author}`)) {
        return { ...book, relevance: 25 };
      }

      return { ...book, relevance };
    })
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);

  return results;
}

/**
 * Filter books by criteria
 */
export function filterBooks(
  books: Book[],
  filters: {
    category?: string;
    minRating?: number;
    maxPrice?: number;
    author?: string;
    language?: string;
  }
): Book[] {
  return books.filter((book) => {
    if (filters.category && book.category !== filters.category) return false;
    if (filters.minRating && (!book.rating || book.rating < filters.minRating)) return false;
    if (filters.maxPrice && (!book.price || book.price > filters.maxPrice)) return false;
    if (filters.author && book.author !== filters.author) return false;
    if (filters.language && book.language !== filters.language) return false;
    return true;
  });
}

/**
 * Sort books by various criteria
 */
export function sortBooks(
  books: Book[],
  sortBy: 'title' | 'author' | 'rating' | 'newest' | 'trending' | 'price'
): Book[] {
  const sorted = [...books];

  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'author':
      return sorted.sort((a, b) => a.author.localeCompare(b.author));
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return sorted.sort((a, b) => {
        const aDate = new Date(a.publishedDate || 0).getTime();
        const bDate = new Date(b.publishedDate || 0).getTime();
        return bDate - aDate;
      });
    case 'trending':
      // Could use view count or other metrics
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'price':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    default:
      return sorted;
  }
}

/**
 * Get suggested search queries based on history
 */
export function getSuggestedQueries(searchHistory: string[], currentQuery: string): string[] {
  if (!currentQuery.trim()) {
    return searchHistory.slice(0, 5);
  }

  return searchHistory
    .filter((query) => query.toLowerCase().includes(currentQuery.toLowerCase()))
    .slice(0, 5);
}

/**
 * Get trending searches based on frequency
 */
export function getTrendingSearches(searchHistory: string[]): Array<{ query: string; count: number }> {
  const frequency: Record<string, number> = {};

  for (const query of searchHistory) {
    frequency[query] = (frequency[query] || 0) + 1;
  }

  return Object.entries(frequency)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
