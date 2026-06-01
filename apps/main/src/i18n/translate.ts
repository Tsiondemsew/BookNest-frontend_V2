import type { Messages } from './index';

type Path = string;

function resolvePath(obj: Record<string, unknown>, path: Path): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}

export function translate(
  messages: Messages,
  key: Path,
  params?: Record<string, string | number>,
  fallback?: string
): string {
  let text = resolvePath(messages as unknown as Record<string, unknown>, key) ?? fallback ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), String(value));
    }
  }
  return text;
}

export function isLocale(value: string): value is 'en' | 'am' {
  return value === 'en' || value === 'am';
}
