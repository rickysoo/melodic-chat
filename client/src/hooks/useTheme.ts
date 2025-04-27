import { useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();

  // Only initialize theme on mount, not on every update
  useEffect(() => {
    // Initialize theme based on user preference
    const savedTheme = localStorage.getItem('melodic_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once

  return {
    theme,
    setTheme,
    systemTheme
  };
}
