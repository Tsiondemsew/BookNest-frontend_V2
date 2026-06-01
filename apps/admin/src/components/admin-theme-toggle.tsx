'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function AdminThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted transition hover:bg-surface hover:text-foreground"
      aria-label={!mounted ? 'Toggle theme' : theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={!mounted ? 'Toggle theme' : theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {!mounted ? (
        <Moon size={15} />
      ) : theme === 'dark' ? (
        <Sun size={15} />
      ) : (
        <Moon size={15} />
      )}
    </button>
  );
}
