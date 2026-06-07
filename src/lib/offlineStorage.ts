// Offline storage utility for caching data

const CACHE_PREFIX = 'caliguide-cache-';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export function setCache<T>(key: string, data: T, expiry: number = CACHE_EXPIRY): void {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    expiry,
  };
  localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
}

export function getCache<T>(key: string): T | null {
  const itemStr = localStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!itemStr) return null;

  try {
    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    // Check if expired
    if (now - item.timestamp > item.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return item.data;
  } catch {
    return null;
  }
}

export function removeCache(key: string): void {
  localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

export function clearAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

export function getCacheSize(): number {
  let size = 0;
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      size += localStorage.getItem(key)?.length || 0;
    }
  });
  return size;
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Add online/offline event listeners
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
