export function cn(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(' ');
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

