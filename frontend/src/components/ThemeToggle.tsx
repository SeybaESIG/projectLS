import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import styles from './ThemeToggle.module.css';

type ThemeVariant = 'light' | 'dark';

const getInitialTheme = (): ThemeVariant => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem('theme-preference');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeVariant>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem('theme-preference', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem('theme-preference');
      if (!stored || (stored !== 'light' && stored !== 'dark')) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      title={isDark ? 'Basculer sur le thème clair' : 'Basculer sur le thème sombre'}
    >
      <span className={styles.icon} aria-hidden="true">
        {isDark ? <FaSun /> : <FaMoon />}
      </span>
      <span className={styles.label}>{isDark ? 'Clair' : 'Sombre'}</span>
    </button>
  );
};

export default ThemeToggle;


