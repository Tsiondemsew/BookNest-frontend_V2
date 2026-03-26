/**
 * Analytics utilities for tracking user behavior
 * Integrates with Sentry for error tracking
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

const events: AnalyticsEvent[] = [];

/**
 * Track user action
 */
export function trackEvent(name: string, properties?: Record<string, any>) {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
  };

  events.push(event);

  // Send to analytics service (e.g., Sentry, Mixpanel)
  try {
    if (typeof window !== 'undefined' && window.__SENTRY__) {
      window.__SENTRY__.captureMessage(name, 'info', {
        extra: properties,
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to send event:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, properties?: Record<string, any>) {
  trackEvent('page_view', {
    path,
    ...properties,
  });
}

/**
 * Track book interaction
 */
export function trackBookAction(action: string, bookId: string, properties?: Record<string, any>) {
  trackEvent(`book_${action}`, {
    bookId,
    ...properties,
  });
}

/**
 * Track reading progress
 */
export function trackReadingProgress(bookId: string, progress: number) {
  trackEvent('reading_progress', {
    bookId,
    progress: Math.round(progress),
  });
}

/**
 * Track search action
 */
export function trackSearch(query: string, resultCount: number) {
  trackEvent('search', {
    query,
    resultCount,
  });
}

/**
 * Track social action
 */
export function trackSocialAction(action: string, targetId: string) {
  trackEvent(`social_${action}`, {
    targetId,
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(metric: string, value: number, unit = 'ms') {
  trackEvent('performance', {
    metric,
    value,
    unit,
  });
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary() {
  return {
    totalEvents: events.length,
    events: events.slice(-100), // Last 100 events
    eventsByType: events.reduce(
      (acc, event) => {
        acc[event.name] = (acc[event.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

/**
 * Clear analytics (for testing/privacy)
 */
export function clearAnalytics() {
  events.length = 0;
}

/**
 * Send analytics batch to server
 */
export async function sendAnalyticsBatch() {
  if (events.length === 0) return;

  try {
    const batch = [...events];
    events.length = 0;

    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('[Analytics] Failed to send batch:', error);
  }
}

/**
 * Setup periodic analytics batch sending
 */
export function startAnalyticsBatching(intervalMs = 60000) {
  const interval = setInterval(() => {
    sendAnalyticsBatch();
  }, intervalMs);

  // Send on page unload
  const handleUnload = () => {
    clearInterval(interval);
    sendAnalyticsBatch();
  };

  window.addEventListener('beforeunload', handleUnload);

  return () => {
    clearInterval(interval);
    window.removeEventListener('beforeunload', handleUnload);
  };
}
