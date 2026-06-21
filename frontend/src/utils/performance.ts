/**
 * =============================================================================
 * Performance Monitoring Utilities
 * =============================================================================
 *
 * PURPOSE:
 * Tracks Core Web Vitals (LCP, INP, CLS) and custom performance metrics
 * for the ChatSphere frontend application.
 *
 * WHY THIS EXISTS:
 * - Core Web Vitals affect SEO rankings (Google uses them)
 * - Real User Monitoring (RUM) catches issues synthetic tests miss
 * - Performance budgets prevent regressions
 *
 * METRICS TRACKED:
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - Custom: Message send time, AI response time
 *
 * USAGE:
 *   import { initPerformanceMonitoring } from '@/utils/performance';
 *   initPerformanceMonitoring(); // Call once on app start
 *
 * LEARNING NOTES:
 * - web-vitals library is lightweight (~1.5KB gzipped)
 * - Metrics are reported on page lifecycle events
 * - Bad metrics (> threshold) should trigger alerts
 * - Good metrics confirm optimizations are working
 * =============================================================================
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

type MetricCallback = (metric: PerformanceMetric) => void;

/** Thresholds for Core Web Vitals ratings */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
};

/** Rate a metric value against thresholds */
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/** Store metrics in memory for debugging */
const metricsStore: PerformanceMetric[] = [];

/** Report a metric to the store and optional callback */
function reportMetric(name: string, value: number, callback?: MetricCallback) {
  const metric: PerformanceMetric = {
    name,
    value,
    rating: rateMetric(name, value),
    timestamp: Date.now(),
  };

  metricsStore.push(metric);

  // Log to console in development
  if (import.meta.env.DEV) {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} [Perf] ${name}: ${value.toFixed(1)}ms (${metric.rating})`);
  }

  callback?.(metric);
}

/**
 * Initialize performance monitoring.
 *
 * Uses the PerformanceObserver API to track Core Web Vitals.
 * Falls back gracefully if the API is not available.
 *
 * @param onMetric - Optional callback for each metric
 */
export function initPerformanceMonitoring(onMetric?: MetricCallback) {
  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        reportMetric('LCP', lastEntry.startTime, onMetric);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // PerformanceObserver not supported
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
          clsValue += (entry as unknown as { value: number }).value;
        }
      }
      reportMetric('CLS', clsValue, onMetric);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // PerformanceObserver not supported
  }

  // INP - Interaction to Next Paint (approximate via event timing)
  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = (entry as unknown as { duration: number }).duration;
        reportMetric('INP', duration, onMetric);
      }
    });
    inpObserver.observe({ type: 'event', buffered: true });
  } catch {
    // PerformanceObserver not supported
  }
}

/**
 * Track a custom timing metric.
 *
 * Use for measuring specific operations like message send time.
 *
 * @param name - Metric name
 * @param startTime - Performance.now() when the operation started
 * @param onMetric - Optional callback
 */
export function trackTiming(name: string, startTime: number, onMetric?: MetricCallback) {
  const duration = performance.now() - startTime;
  reportMetric(name, duration, onMetric);
}

/**
 * Get all collected metrics.
 *
 * Useful for debugging and displaying in a dev panel.
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metricsStore];
}

/**
 * Clear collected metrics.
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}
