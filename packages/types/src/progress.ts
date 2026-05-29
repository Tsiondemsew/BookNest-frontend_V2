export interface SyncProgressRequest {
  book_format_id: string;
  progress_percent: number;
  last_position: number;
}

export interface SyncProgressResponse {
  success: boolean;
  message?: string;
}
