"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme;
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100" />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-white"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={18} className="text-yellow-500" />
      ) : (
        <Moon size={18} className="text-slate-700" />
      )}
    </button>
  );
}
