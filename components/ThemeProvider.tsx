"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    // Ensure light mode on mount if no theme is set
    const theme = localStorage.getItem('theme');
    if (!theme || (theme !== 'dark' && theme !== 'light')) {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
