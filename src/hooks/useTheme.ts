
import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/utils/storage';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const settings = getSettings();
    return settings.theme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return theme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme === 'dark' ? 'dark' : 'light');
    }
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    
    // Update settings
    const settings = getSettings();
    saveSettings({ ...settings, theme });
    
    // Apply font size from settings
    const fontScale = settings.fontScale || 1.0;
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [theme, resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => setTheme(newTheme),
  };
}
