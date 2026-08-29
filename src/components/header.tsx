import { headers } from "next/headers";
import { rootUrl, subdomainUrl, type Section } from "@/lib/domains";
import { HeaderBar } from "@/components/header-bar";

const nav: { label: string; section: Section }[] = [
  { label: "projects", section: "projects" },
  { label: "writing", section: "writing" },
  { label: "playground", section: "playground" },
];

// Server half of the header: resolves the cross-subdomain URLs from the
// request host, then hands off to the client HeaderBar (which owns the
// sticky/scroll-shadow behavior).
export async function Header() {
  const host = (await headers()).get("host") ?? "";

  return (
    <HeaderBar
      homeHref={rootUrl(host)}
      items={nav.map((item) => ({
        label: item.label,
        href: subdomainUrl(host, item.section),
      }))}
    />
  );
}
