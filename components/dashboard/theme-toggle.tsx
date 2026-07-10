"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "formula-room-theme";

type ThemeMode = "light" | "dark";

function applyTheme(nextTheme: ThemeMode) {
  const root = document.documentElement;
  const isDark = nextTheme === "dark";

  root.classList.toggle("dark", isDark);
  root.dataset.theme = nextTheme;
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  function handleThemeChange(nextTheme: ThemeMode) {
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const activeTheme = mounted ? theme : "dark";

  return (
    <div className="flex gap-0.5 rounded-[8px] border border-[var(--color-line2)] bg-white p-[3px]">
      <button
        type="button"
        onClick={() => handleThemeChange("light")}
        title="Light mode"
        aria-label="Switch to light theme"
        aria-pressed={mounted ? theme === "light" : false}
        className={cn(
          "flex h-[28px] w-[28px] items-center justify-center rounded-[5px] transition-all",
          activeTheme === "light" ? "bg-[var(--color-bg2)] text-ink" : "text-ink3 hover:text-ink2",
        )}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange("dark")}
        title="Dark mode"
        aria-label="Switch to dark theme"
        aria-pressed={mounted ? theme === "dark" : true}
        className={cn(
          "flex h-[28px] w-[28px] items-center justify-center rounded-[5px] transition-all",
          activeTheme === "dark" ? "bg-[var(--color-bg2)] text-ink" : "text-ink3 hover:text-ink2",
        )}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
