import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  getCacheSize,
  isOnline,
} from './offlineStorage';

describe('Offline Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('setCache and getCache work correctly', () => {
    const testData = { name: 'Test', value: 123 };
    setCache('test-key', testData);

    const retrieved = getCache<typeof testData>('test-key');
    expect(retrieved).toEqual(testData);
  });

  test('getCache returns null for non-existent key', () => {
    const result = getCache('non-existent');
    expect(result).toBeNull();
  });

  test('getCache returns null for expired cache', () => {
    vi.useFakeTimers();

    const testData = { name: 'Test' };
    setCache('test-key', testData, 1000); // 1 second expiry

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000);

    const result = getCache('test-key');
    expect(result).toBeNull();

    vi.useRealTimers();
  });

  test('removeCache removes cached data', () => {
    setCache('test-key', 'test-value');
    removeCache('test-key');

    const result = getCache('test-key');
    expect(result).toBeNull();
  });

  test('clearAllCache removes all cached data', () => {
    setCache('key1', 'value1');
    setCache('key2', 'value2');
    clearAllCache();

    expect(getCache('key1')).toBeNull();
    expect(getCache('key2')).toBeNull();
  });

  test('getCacheSize returns correct size', () => {
    setCache('key1', 'value1');
    setCache('key2', 'value2');

    const size = getCacheSize();
    expect(size).toBeGreaterThan(0);
  });

  test('isOnline returns boolean', () => {
    const result = isOnline();
    expect(typeof result).toBe('boolean');
  });
});
