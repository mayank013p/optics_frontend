/**
 * Client-Side SWR Caching Layer for Optics
 * Provides instant zero-latency rendering from localStorage with background revalidation.
 */

const CACHE_PREFIX = 'optics_swr_cache_';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const getCache = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return fallback;
    const parsed: CacheEntry<T> = JSON.parse(raw);
    return parsed.data !== undefined ? parsed.data : fallback;
  } catch (err) {
    console.warn(`[Optics Cache] Read error for key "${key}":`, err);
    return fallback;
  }
};

export const setCache = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (err) {
    console.warn(`[Optics Cache] Write error for key "${key}":`, err);
  }
};

export const removeCache = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[Optics Cache] Remove error for key "${key}":`, err);
  }
};

export const clearAllOpticsCache = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[Optics Cache] Clear all error:', err);
  }
};
