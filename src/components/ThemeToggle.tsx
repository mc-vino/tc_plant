"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [state, setState] = useState<{ mounted: boolean; theme: Theme | null }>({
    mounted: false,
    theme: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const theme = stored === "light" || stored === "dark" ? (stored as Theme) : null;
    // Initialize from storage once, after mount, to avoid an SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ mounted: true, theme });
  }, []);

  const isDark = state.mounted
    ? state.theme
      ? state.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setState({ mounted: true, theme: next });
  }

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="press flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
    >
      {state.mounted && (isDark ? <Sun size={17} /> : <Moon size={17} />)}
    </button>
  );
}
