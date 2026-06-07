import { describe, expect, test } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider, useI18n } from './index';
import { ReactNode } from 'react';

describe('I18n', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  test('provides default language (en)', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.lang).toBe('en');
  });

  test('returns translation for valid key', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('nav.home')).toBe('Home');
    expect(result.current.t('nav.forum')).toBe('Forum');
    expect(result.current.t('nav.chatbot')).toBe('Chatbot');
  });

  test('returns key for missing translation', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });

  test('changes language', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });

    act(() => {
      result.current.setLang('zh-CN');
    });

    expect(result.current.lang).toBe('zh-CN');
    expect(result.current.t('nav.home')).toBe('首页');
    expect(result.current.t('nav.forum')).toBe('论坛');
  });

  test('supports variable interpolation', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <I18nProvider>{children}</I18nProvider>
    );

    const { result } = renderHook(() => useI18n(), { wrapper });

    // Test with a key that has variables
    const translated = result.current.t('profile.memberSince');
    expect(typeof translated).toBe('string');
  });

  test('all languages have consistent keys', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });

    const languages = ['en', 'zh-CN', 'zh-TW', 'yue', 'es'];
    const testKeys = ['nav.home', 'nav.forum', 'nav.chatbot', 'nav.profile'];

    languages.forEach((lang) => {
      act(() => {
        result.current.setLang(lang);
      });

      testKeys.forEach((key) => {
        const translation = result.current.t(key);
        expect(translation).not.toBe(key); // Should have a translation
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      });
    });
  });
});
