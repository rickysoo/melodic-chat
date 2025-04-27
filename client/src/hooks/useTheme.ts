import { useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();

  useEffect(() => {
    // Initialize theme based on user preference
    const savedTheme = localStorage.getItem('melodic_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Save theme preference when it changes
  useEffect(() => {
    if (theme) {
      localStorage.setItem('melodic_theme', theme);
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    systemTheme
  };
}
