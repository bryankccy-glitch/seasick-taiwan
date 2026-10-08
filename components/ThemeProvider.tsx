"use client";
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { resolveTheme, THEME_KEY, type Theme } from "@/lib/theme";

const EVENT = "seasick-theme-change";
function readTheme(): Theme { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; }
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(callback: () => void) {
  const system = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: light)") : null;
  const followSystem = () => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch { /* Follow the system even when persistence is unavailable. */ }
    applyTheme(resolveTheme(stored, system?.matches ?? false));
  };
  const onStorage = (event: StorageEvent) => { if (event.key === THEME_KEY || event.key === null) followSystem(); };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  system?.addEventListener("change", followSystem);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
    system?.removeEventListener("change", followSystem);
  };
}
const ThemeContext = createContext<{theme:Theme;toggle:()=>void}|null>(null);
export function ThemeProvider({children}:{children:ReactNode}) {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "dark");
  function toggle() {
    const next = readTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Switching still works when storage is blocked. */ }
    applyTheme(next);
  }
  return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
}
export function ThemeToggle({language}:{language:"zh"|"en"}) {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeToggle requires ThemeProvider");
  return <button type="button" className="theme-toggle" onClick={context.toggle} aria-label={language==="zh"?"切換深色／淺色主題":"Toggle dark / light theme"} title={context.theme==="dark"?"Ocean Morning · Light":"Ocean Dark"}>
    <Sun className="theme-sun" aria-hidden="true"/><Moon className="theme-moon" aria-hidden="true"/>
  </button>;
}
