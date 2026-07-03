import { parentDomain } from "@/lib/domains";

// Client-side theme helpers. Sections live on separate subdomains (separate
// origins), so the preference is persisted to a cookie scoped to the parent
// domain (works in production) and carried via a `?theme=` URL param across
// cross-subdomain navigation (works in dev on *.localhost, where browsers
// reject a shared cookie for a single-label domain). See `themeInit` in
// `app/layout.tsx`.

// A link to another section subdomain of this same site.
export function isInternalCrossHost(url: URL): boolean {
  if (url.hostname === window.location.hostname) return false;
  const pd = parentDomain(window.location.hostname);
  if (!pd) return false;
  return url.hostname === pd || url.hostname.endsWith(`.${pd}`);
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}

// Apply and persist a theme choice.
export function setTheme(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
  const value = isDark ? "dark" : "light";
  try {
    const domain = parentDomain(window.location.hostname);
    document.cookie =
      `theme=${value};path=/;max-age=31536000;samesite=lax` +
      (domain ? `;domain=${domain}` : "");
    localStorage.setItem("theme", value);
  } catch {}
}
