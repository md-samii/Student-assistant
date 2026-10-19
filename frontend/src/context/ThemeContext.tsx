import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'student_assistant_theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('dark');
  }
  return 'light';
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    const initial = getInitialTheme();
    return initial === 'system' ? getSystemTheme() : initial;
  });

  const applyThemeToDOM = (resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setEffectiveTheme(resolvedTheme);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to persist theme setting:', e);
    }

    if (newTheme === 'system') {
      applyThemeToDOM(getSystemTheme());
    } else {
      applyThemeToDOM(newTheme);
    }
  };

  useEffect(() => {
    // Initial sync
    if (theme === 'system') {
      applyThemeToDOM(getSystemTheme());
    } else {
      applyThemeToDOM(theme);
    }

    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only react if system mode is currently active
      const currentTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || theme;
      if (currentTheme === 'system') {
        applyThemeToDOM(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
