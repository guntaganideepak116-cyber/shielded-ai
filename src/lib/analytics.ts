// SECURESHIELD AI - Analytics Infrastructure
// This module provides a unified interface for tracking user interactions.
// In production, swap the console logs for PostHog or Google Analytics.

export type AnalyticsEvent = 
  | 'scan_started'
  | 'scan_completed'
  | 'report_downloaded'
  | 'fix_applied'
  | 'auth_success'
  | 'platform_detected';

export const trackEvent = (event: AnalyticsEvent, properties?: Record<string, any>) => {
  // Console logging for development
  console.log(`[Analytics] ${event}`, properties);

  // Example PostHog integration (commented out for now):
  /*
  if (window.posthog) {
    window.posthog.capture(event, properties);
  }
  */
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  console.log(`[Analytics] Identify User: ${userId}`, traits);
  /*
  if (window.posthog) {
    window.posthog.identify(userId, traits);
  }
  */
};
