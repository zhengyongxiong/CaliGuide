import { describe, expect, test, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { authApi, guidesApi, forumApi, eventsApi } from './api';

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
  });

  describe('authApi', () => {
    test('login sends correct request', async () => {
      const mockResponse = { token: 'test-token', user: { id: '1', name: 'Test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authApi.login({ email: 'test@example.com', password: 'password123' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('register sends correct request', async () => {
      const mockResponse = { token: 'test-token', user: { id: '1', name: 'Test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authApi.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('throws error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      await expect(
        authApi.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('guidesApi', () => {
    test('list sends GET request', async () => {
      const mockGuides = [{ id: '1', title: 'Test Guide' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGuides),
      });

      const result = await guidesApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/guides',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockGuides);
    });

    test('list with search params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await guidesApi.list({ search: 'DMV' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/guides?search=DMV',
        expect.anything()
      );
    });
  });

  describe('forumApi', () => {
    test('create sends POST request', async () => {
      const mockPost = { id: '1', title: 'Test Post' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      });

      const result = await forumApi.create({
        title: 'Test Post',
        content: 'Test content',
        category: 'General',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/forum',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: 'Test Post',
            content: 'Test content',
            category: 'General',
          }),
        })
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('eventsApi', () => {
    test('list sends GET request', async () => {
      const mockEvents = [{ id: '1', title: 'Test Event' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      });

      const result = await eventsApi.list();

      expect(result).toEqual(mockEvents);
    });

    test('register sends POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await eventsApi.register('event-1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/events/event-1/register',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
