/**
 * Theme utilities for handling dark/light mode
 */

export type Theme = 'light' | 'dark' | 'system';

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getStoredTheme = (): Theme => {
  return (localStorage.getItem('theme') as Theme) || 'system';
};

export const setTheme = (theme: Theme): void => {
  if (theme === 'system') {
    localStorage.removeItem('theme');
    applyTheme(getSystemTheme());
  } else {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }
};

export const applyTheme = (theme: 'light' | 'dark'): void => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Initialize theme
export const initializeTheme = (): void => {
  const storedTheme = getStoredTheme();
  
  if (storedTheme === 'system') {
    applyTheme(getSystemTheme());
  } else {
    applyTheme(storedTheme);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      applyTheme(getSystemTheme());
    }
  });
};

export default {
  getSystemTheme,
  getStoredTheme,
  setTheme,
  applyTheme,
  initializeTheme,
};