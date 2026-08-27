/**
 * Advanced Client-Side Asset Cache & Memory Manager
 * Stores preloaded images and assets in memory and CacheStorage
 * to eliminate repetitive network requests and optimize frame rates.
 */

const MEMORY_CACHE = new Map<string, string>();
const PRELOADED_SET = new Set<string>();

// Cache name for Kanri App
const CACHE_NAME = 'kanri-local-asset-cache-v1';

/**
 * Preloads and caches an image in browser cache & local memory.
 */
export async function preloadAndCacheImage(url: string): Promise<string> {
  if (!url) return '';
  if (MEMORY_CACHE.has(url)) {
    return MEMORY_CACHE.get(url)!;
  }

  try {
    // Check CacheStorage API if available
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        MEMORY_CACHE.set(url, objectUrl);
        return objectUrl;
      }

      // Fetch and store in cache
      const response = await fetch(url, { cache: 'force-cache' });
      if (response.ok) {
        await cache.put(url, response.clone());
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        MEMORY_CACHE.set(url, objectUrl);
        return objectUrl;
      }
    }
  } catch {
    // Fallback: Standard browser image memory preloader
  }

  // Fallback memory image preloader
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      PRELOADED_SET.add(url);
      MEMORY_CACHE.set(url, url);
      resolve(url);
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

/**
 * Batch preload essential assets in the background without blocking UI thread.
 */
export function preloadCriticalAssets(urls: string[]) {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback if available, otherwise setTimeout
  const runner = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));

  runner(() => {
    urls.forEach((url) => {
      if (!PRELOADED_SET.has(url)) {
        preloadAndCacheImage(url);
      }
    });
  });
}

/**
 * Preload all Kaizen Improvement slides and thumbnails into local memory
 */
export function initKaizenMemoryCache() {
  const slides = [
    '/assets/improvements/1.jpeg',
    '/assets/improvements/2.png',
    '/assets/improvements/3.png',
    '/assets/improvements/4.png',
    '/assets/improvements/5.png',
    '/assets/improvements/6.png',
    '/assets/improvements/7.png',
    '/assets/improvements/8.png',
    '/assets/improvements/9.jpeg',
    '/assets/improvements/pilar_ohc_summary_infographic.jpg',
    '/assets/improvements/ubf_st5_real_mapping.png'
  ];

  preloadCriticalAssets(slides);
}
