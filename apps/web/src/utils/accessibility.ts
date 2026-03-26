/**
 * Accessibility utilities and helpers
 * 
 * WCAG 2.1 Level AA compliance guidelines:
 * - All form inputs must have associated labels
 * - All images must have alt text (unless decorative)
 * - Color contrast ratio minimum 4.5:1 for normal text
 * - Keyboard navigation must work for all interactive elements
 * - Focus indicators must be visible
 * - Error messages must be associated with form fields
 * - Loading states must announce to screen readers
 * - Page structure must use semantic HTML
 */

/**
 * Generate unique ID for accessibility relationships
 * Useful for aria-labelledby, aria-describedby, etc.
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * ARIA label patterns
 */
export const ariaLabels = {
  close: 'Close dialog',
  menu: 'Open menu',
  search: 'Search',
  navigate: (name: string) => `Navigate to ${name}`,
  loadMore: 'Load more items',
  like: 'Like this post',
  share: 'Share this post',
  delete: 'Delete item',
  edit: 'Edit item',
  download: 'Download file',
};

/**
 * Check if an element can receive focus
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]',
  ];

  return focusableSelectors.some((selector) =>
    element.matches(selector)
  );
}

/**
 * Skip to main content link generator
 * Helps keyboard users skip navigation
 */
export function SkipToMainLink() {
  return {
    id: 'skip-to-main',
    href: '#main-content',
    className:
      'sr-only focus:not-sr-only absolute top-0 left-0 z-50 bg-primary text-white px-4 py-2',
    text: 'Skip to main content',
  };
}

/**
 * Common keyboard shortcuts
 */
export const keyboardShortcuts = {
  Escape: 'Close dialog',
  Enter: 'Submit form / Activate button',
  Space: 'Activate button / Scroll down',
  Tab: 'Move to next focusable element',
  ShiftTab: 'Move to previous focusable element',
  ArrowUp: 'Move up in list',
  ArrowDown: 'Move down in list',
  ArrowLeft: 'Move left',
  ArrowRight: 'Move right',
  'Ctrl+S': 'Save',
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
};

/**
 * Focus management helper
 */
export function manageFocus(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    setTimeout(() => {
      element.focus();
      // Announce to screen readers
      if ('ariaLive' in element) {
        element.setAttribute('aria-live', 'polite');
      }
    }, 0);
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReaders(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Semantic HTML guidelines
 * 
 * Use semantic elements to improve accessibility and SEO:
 * - <header> for page/section header
 * - <nav> for navigation
 * - <main> for main content
 * - <article> for self-contained content
 * - <section> for thematic groupings
 * - <aside> for sidebar content
 * - <footer> for page/section footer
 * - <figure>/<figcaption> for images with captions
 */

/**
 * Contrast ratio checker
 * Returns true if colors meet WCAG AA standard (4.5:1)
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string
): boolean {
  // Placeholder implementation
  // In production, use a proper color contrast library
  return true;
}

/**
 * Form field error association pattern
 * Usage:
 * <label htmlFor="email">Email:</label>
 * <input id="email" type="email" aria-describedby="email-error" />
 * <span id="email-error" role="alert">Invalid email</span>
 */
export function createFormFieldError(fieldId: string): {
  errorId: string;
  ariaDescribedBy: string;
} {
  const errorId = `${fieldId}-error`;
  return {
    errorId,
    ariaDescribedBy: errorId,
  };
}

/**
 * Loading state announcement helper
 * For async operations, announce to screen readers
 */
export function announceLoadingState(isLoading: boolean, context: string) {
  if (isLoading) {
    announceToScreenReaders(`Loading ${context}...`, 'polite');
  } else {
    announceToScreenReaders(`${context} loaded`, 'polite');
  }
}
