/**
 * Toast notification system
 * Lightweight notification management without external dependencies
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Store for listeners
const listeners = new Set<(toast: Toast) => void>();
const removeListeners = new Set<(id: string) => void>();

/**
 * Subscribe to toast events
 */
export function onToastAdd(listener: (toast: Toast) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Subscribe to toast removal events
 */
export function onToastRemove(listener: (id: string) => void) {
  removeListeners.add(listener);
  return () => removeListeners.delete(listener);
}

/**
 * Emit toast event to all listeners
 */
function emitToast(toast: Toast) {
  listeners.forEach((listener) => listener(toast));

  // Auto-remove after duration
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast.id);
    }, duration);
  }
}

/**
 * Remove toast by ID
 */
function removeToast(id: string) {
  removeListeners.forEach((listener) => listener(id));
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Show toast notification
 */
export function toast(
  message: string,
  options: Partial<Toast> = {}
): string {
  const id = options.id || generateId();
  const newToast: Toast = {
    id,
    message,
    type: options.type || 'info',
    duration: options.duration,
    action: options.action,
  };

  emitToast(newToast);
  return id;
}

/**
 * Show success toast
 */
export function toastSuccess(
  message: string,
  options: Partial<Omit<Toast, 'type'>> = {}
) {
  return toast(message, { ...options, type: 'success' });
}

/**
 * Show error toast
 */
export function toastError(
  message: string,
  options: Partial<Omit<Toast, 'type'>> = {}
) {
  return toast(message, { ...options, type: 'error' });
}

/**
 * Show info toast
 */
export function toastInfo(
  message: string,
  options: Partial<Omit<Toast, 'type'>> = {}
) {
  return toast(message, { ...options, type: 'info' });
}

/**
 * Show warning toast
 */
export function toastWarning(
  message: string,
  options: Partial<Omit<Toast, 'type'>> = {}
) {
  return toast(message, { ...options, type: 'warning' });
}

/**
 * Show loading toast
 */
export function toastLoading(message: string) {
  return toast(message, { type: 'info', duration: 0 });
}

/**
 * Close toast by ID
 */
export function closeToast(id: string) {
  removeToast(id);
}
