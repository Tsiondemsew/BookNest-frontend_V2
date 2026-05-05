export type EntityId = string;

export type ISODateString = string; // e.g. "2026-04-07T12:00:00Z"

export type AppLocale = 'en' | 'am';

export type LanguageCode = string;

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';
