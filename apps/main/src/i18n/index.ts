import { en, type Messages } from './locales/en';
import { am } from './locales/am';

export type Locale = 'en' | 'am';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'booknest:locale';

export const LOCALE_META: Record<
  Locale,
  { label: string; nativeLabel: string; code: string; dir: 'ltr' | 'rtl' }
> = {
  en: { label: 'English', nativeLabel: 'English', code: 'EN', dir: 'ltr' },
  am: { label: 'Amharic', nativeLabel: 'አማርኛ', code: 'AM', dir: 'ltr' },
};

export const messages: Record<Locale, Messages> = {
  en,
  am,
};

export type { Messages };
