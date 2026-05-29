export type ReaderThemeId = 'white' | 'sepia' | 'gray' | 'dark' | 'warm';

export interface ReaderTheme {
  id: ReaderThemeId;
  label: string;
  pageBg: string;
  chromeBg: string;
  chromeBorder: string;
  text: string;
  textMuted: string;
  canvasBg: string;
  accent: string;
  /** CSS filter on the page canvas — eases contrast for eyes */
  canvasFilter: string;
  /** Soft glow around the page (where the eye focuses) */
  pageGlow: string;
  /** Warm / ambient light overlay on top of the page */
  lightOverlay: string;
  lightBlendMode: 'multiply' | 'soft-light' | 'overlay' | 'normal';
  /** Vignette to reduce peripheral glare */
  vignette: string;
}

export const READER_THEMES: ReaderTheme[] = [
  {
    id: 'white',
    label: 'Light',
    pageBg: '#eef0f2',
    chromeBg: '#ffffff',
    chromeBorder: '#e4e4e7',
    text: '#18181b',
    textMuted: '#71717a',
    canvasBg: '#ffffff',
    accent: '#B85C38',
    canvasFilter: 'contrast(1.02) brightness(1.03)',
    pageGlow: '0 0 40px rgba(255, 252, 245, 0.9), 0 8px 32px rgba(0,0,0,0.08)',
    lightOverlay: 'linear-gradient(180deg, rgba(255,253,248,0.35) 0%, transparent 40%, transparent 60%, rgba(255,250,240,0.2) 100%)',
    lightBlendMode: 'soft-light',
    vignette: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.06) 100%)',
  },
  {
    id: 'sepia',
    label: 'Sepia',
    pageBg: '#e0d5c4',
    chromeBg: '#f5efe4',
    chromeBorder: '#d4c4a8',
    text: '#3d3228',
    textMuted: '#6b5d4d',
    canvasBg: '#faf6ee',
    accent: '#9a3412',
    canvasFilter: 'sepia(0.12) contrast(0.98) brightness(1.05)',
    pageGlow: '0 0 48px rgba(255, 248, 230, 0.85), 0 8px 28px rgba(61,50,40,0.12)',
    lightOverlay: 'linear-gradient(165deg, rgba(255, 236, 200, 0.25) 0%, transparent 50%, rgba(255, 220, 180, 0.15) 100%)',
    lightBlendMode: 'soft-light',
    vignette: 'radial-gradient(ellipse at center, transparent 50%, rgba(80,60,40,0.08) 100%)',
  },
  {
    id: 'warm',
    label: 'Warm light',
    pageBg: '#ddd0bc',
    chromeBg: '#f3ebe0',
    chromeBorder: '#c9b896',
    text: '#3a3028',
    textMuted: '#6b5d4d',
    canvasBg: '#fff9f0',
    accent: '#B85C38',
    canvasFilter: 'sepia(0.08) brightness(1.06) contrast(0.96)',
    pageGlow: '0 0 56px rgba(255, 200, 120, 0.35), 0 0 24px rgba(255, 248, 220, 0.6), 0 10px 30px rgba(0,0,0,0.1)',
    lightOverlay: 'linear-gradient(180deg, rgba(255, 210, 140, 0.22) 0%, rgba(255, 245, 220, 0.08) 45%, rgba(255, 200, 150, 0.12) 100%)',
    lightBlendMode: 'overlay',
    vignette: 'radial-gradient(ellipse at center, transparent 45%, rgba(120, 80, 40, 0.1) 100%)',
  },
  {
    id: 'gray',
    label: 'Soft gray',
    pageBg: '#cfd1d6',
    chromeBg: '#e4e4e7',
    chromeBorder: '#a1a1aa',
    text: '#27272a',
    textMuted: '#52525b',
    canvasBg: '#f8f8f9',
    accent: '#B85C38',
    canvasFilter: 'brightness(1.04) contrast(0.97)',
    pageGlow: '0 0 36px rgba(255,255,255,0.7), 0 6px 24px rgba(0,0,0,0.1)',
    lightOverlay: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
    lightBlendMode: 'soft-light',
    vignette: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.07) 100%)',
  },
  {
    id: 'dark',
    label: 'Dark',
    pageBg: '#09090b',
    chromeBg: '#18181b',
    chromeBorder: '#3f3f46',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    canvasBg: '#2a2a2e',
    accent: '#e07a52',
    canvasFilter: 'brightness(0.92) contrast(1.05)',
    pageGlow: '0 0 32px rgba(224, 122, 82, 0.15), 0 8px 24px rgba(0,0,0,0.5)',
    lightOverlay: 'linear-gradient(180deg, rgba(255,200,150,0.06) 0%, transparent 100%)',
    lightBlendMode: 'soft-light',
    vignette: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
  },
];

export function getReaderTheme(id: ReaderThemeId): ReaderTheme {
  return READER_THEMES.find((t) => t.id === id) ?? READER_THEMES[1];
}
