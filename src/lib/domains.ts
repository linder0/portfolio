// Section subdomains. Each of these is served from `<section>.lindaxue.com`
// (and `<section>.localhost:<port>` in development) but the pages themselves
// live at `/<section>` in the app. `proxy.ts` rewrites the subdomain to the
// path, and the helpers below build the correct absolute/relative links.
export const SECTIONS = ["projects", "writing", "playground"] as const;
export type Section = (typeof SECTIONS)[number];

export function isSection(value: string): value is Section {
  return (SECTIONS as readonly string[]).includes(value);
}

type HostParts = {
  hostname: string;
  port: string;
  isLocal: boolean;
  protocol: "http" | "https";
  subdomain: string;
  root: string;
};

// Break a Host header (e.g. "projects.lindaxue.com", "projects.localhost:3000")
// into its subdomain and root-domain parts.
export function parseHost(host: string): HostParts {
  const [hostname = "", port = ""] = host.split(":");
  const labels = hostname.split(".");
  const isLocal =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1";

  let subdomain = "";
  let root = hostname;

  if (isLocal) {
    root = "localhost";
    if (labels.length > 1 && labels[labels.length - 1] === "localhost") {
      subdomain = labels[0];
    }
  } else if (labels.length > 2) {
    subdomain = labels[0];
    root = labels.slice(1).join(".");
  }

  // Treat "www" as the bare root, not a section subdomain.
  if (subdomain === "www") subdomain = "";

  return {
    hostname,
    port,
    isLocal,
    protocol: isLocal ? "http" : "https",
    subdomain,
    root,
  };
}

function origin({ protocol, root, port }: HostParts, sub?: string): string {
  const hostPart = sub ? `${sub}.${root}` : root;
  return `${protocol}://${hostPart}${port ? `:${port}` : ""}`;
}

// Absolute URL to a section, e.g. https://projects.lindaxue.com. Local hosts
// keep subdomains too (projects.localhost:<port>) so the proxy rewrite stays
// testable in dev.
export function subdomainUrl(host: string, section: Section): string {
  return origin(parseHost(host), section);
}

// Absolute URL to the bare root domain, e.g. https://lindaxue.com
export function rootUrl(host: string): string {
  return origin(parseHost(host));
}

// The prefix to use for links *within* a section. On the section's own
// subdomain links are root-relative (""), so `${sectionBase}/${slug}` becomes
// `/slug`; everywhere else they keep the `/section` prefix.
export function sectionBase(host: string, section: Section): string {
  return parseHost(host).subdomain === section ? "" : `/${section}`;
}

// The registrable parent domain, shared by every section subdomain — the
// scope for cross-subdomain cookies (theme, session). Returns null for IPs,
// where a Domain attribute isn't valid; note browsers still reject a shared
// cookie on "localhost", so dev callers treat that value as host-only.
export function parentDomain(hostname: string): string | null {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return "localhost";
  }
  if (/^[\d.]+$/.test(hostname)) return null; // IP address
  const parts = hostname.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
}
