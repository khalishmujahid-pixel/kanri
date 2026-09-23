import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'safety' | 'midnight' | 'presentation' | 'aurora';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'safety',
  setTheme: () => {},
});

const STORAGE_KEY = 'kanri-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'safety' || saved === 'midnight' || saved === 'presentation' || saved === 'aurora') return saved;
    } catch {}
    return 'safety';
  });

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Set attribute on initial mount as well
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
