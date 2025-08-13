import { useState, useEffect } from 'react';

interface UseThemeReturn {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function useTheme(): UseThemeReturn {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // 优先读取 localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // 其次跟随系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      console.log(darkMode,"111")
    } else {
      document.documentElement.classList.remove('dark');
      console.log(darkMode,"222")
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return { darkMode, toggleDarkMode };
}
