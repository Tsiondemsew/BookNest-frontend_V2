export interface SyncProgressRequest {
  book_format_id: string;
  progress_percent: number;
  last_position: number;
  pages_delta?: number;
  minutes_delta?: number;
  timezone_offset_minutes?: number;
}

export interface SyncProgressResponse {
  success: boolean;
  data?: {
    success: boolean;
    completed?: boolean;
    newly_completed?: boolean;
  };
  message?: string;
}

export interface ReadingProgressItem {
  book_format_id: string;
  progress_percent: number;
  last_position: number | null;
  completed_at: string | null;
  updated_at: string;
}

export interface ProgressListResponse {
  success: boolean;
  data: ReadingProgressItem[];
}
