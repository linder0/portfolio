// Client-side theme helper. The theme follows the OS preference (no manual
// toggle) — the `.dark` class is set before paint by `themeInit` in
// `app/layout.tsx`. This just reads the resulting state for widgets that
// need to know it (e.g. the tweet embed's data-theme).
export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}
