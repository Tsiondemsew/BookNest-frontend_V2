let handler: (() => void) | null = null;

export function registerSessionExpiredHandler(fn: () => void): void {
  handler = fn;
}

export function notifySessionExpired(): void {
  handler?.();
}
