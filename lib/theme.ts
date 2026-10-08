export type Theme = "light" | "dark";
export const THEME_KEY = "seasick-theme";
export function resolveTheme(stored: unknown, prefersLight: boolean): Theme {
  return stored === "light" || stored === "dark" ? stored : prefersLight ? "light" : "dark";
}
// Runs in <head> before paint; no client/server render depends on its result.
export const THEME_BOOTSTRAP = `(()=>{let saved;try{saved=localStorage.getItem("${THEME_KEY}")}catch{}let light=false;try{light=matchMedia("(prefers-color-scheme: light)").matches}catch{}const theme=saved==="light"||saved==="dark"?saved:light?"light":"dark";document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle("dark",theme==="dark")})();`;
