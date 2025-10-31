// services/analyticsService.ts

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GOOGLE_ANALYTICS_SCRIPT_ID = 'google-analytics-script';

/**
 * Initializes the Google Analytics script and configuration.
 * @param measurementId - The Google Analytics Measurement ID (e.g., "G-XXXXXXXXXX").
 */
export const init = (measurementId: string): void => {
  if (!measurementId || typeof window === 'undefined' || !document) {
    return;
  }

  // Avoid re-injecting the script if it already exists
  if (!document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
  }
  
  // Configure for the given measurement ID
  window.gtag('config', measurementId);
};

/**
 * Tracks a custom event in Google Analytics.
 * @param action - The name of the event (e.g., "click").
 * @param category - The category of the event (e.g., "Button").
 * @param label - A label for the event (e.g., "Submit Form").
 * @param value - An optional numeric value for the event.
 */
export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
