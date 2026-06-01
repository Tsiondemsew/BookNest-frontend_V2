/** Public demo media used when the content proxy is unavailable. */
export const DEMO_PDF_URL =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

export const DEMO_AUDIO_URL =
  'https://samplelib.com/lib/preview/mp3/sample-3s.mp3';

export function pickDemoLanguage(bookLanguage: string | null | undefined) {
  const lang = String(bookLanguage || '').toLowerCase();
  if (lang.includes('oromo') || lang.includes('afaan')) return 'Oromo';
  if (lang.includes('amharic') || lang.includes('amh')) return 'Amharic';
  return 'Amharic';
}

export function demoUrlForFormat(
  format: 'pdf' | 'audio',
  bookLanguage?: string | null,
) {
  void pickDemoLanguage(bookLanguage);
  return format === 'audio' ? DEMO_AUDIO_URL : DEMO_PDF_URL;
}
