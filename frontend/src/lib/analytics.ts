// SECUREWEB AI - Analytics Infrastructure
// This module provides a unified interface for tracking user interactions.
// In production, swap the console logs for PostHog or Google Analytics.

import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export type AnalyticsEvent = 
  | 'scan_started'
  | 'scan_completed'
  | 'report_downloaded'
  | 'fix_applied'
  | 'auth_success'
  | 'platform_detected'
  | 'pwa_installed'
  | 'pwa_dismissed';

export const trackEvent = (event: AnalyticsEvent | string, properties?: Record<string, unknown>) => {
  // Console logging for development
  console.log(`[Analytics] ${event}`, properties);

  // Send to Firebase Analytics
  if (analytics) {
    try {
      logEvent(analytics, event, properties);
    } catch (e) {
      console.error('[Analytics] Failed to send event', e);
    }
  }
};

export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  console.log(`[Analytics] Identify User: ${userId}`, traits);
};
