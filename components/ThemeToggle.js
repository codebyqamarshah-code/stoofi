'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch — only render after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer flex items-center justify-center overflow-hidden relative"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
        }}
      >
        <Moon className="h-4 w-4" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)',
        }}
      >
        <Sun className="h-4 w-4 text-amber-400" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
