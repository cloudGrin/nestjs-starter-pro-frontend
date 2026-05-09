import { afterEach, describe, expect, it, vi } from 'vitest';

describe('themeStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light mode for new users even when the system prefers dark', async () => {
    localStorage.removeItem('theme-storage');
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList
    );

    const { useThemeStore } = await import('./themeStore');

    expect(useThemeStore.getState().mode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
