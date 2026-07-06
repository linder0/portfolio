import { headers } from "next/headers";
import { rootUrl, subdomainUrl, type Section } from "@/lib/domains";
import { SocialLinks } from "@/components/social-links";

const nav: { label: string; section: Section }[] = [
  { label: "projects", section: "projects" },
  { label: "writing", section: "writing" },
  { label: "playground", section: "playground" },
];

export async function Sidebar() {
  const host = (await headers()).get("host") ?? "";

  return (
    <>
      {/* Mobile: just the masthead (name) up top. Desktop: the full fixed
          rail with nav + socials. */}
      <aside className="flex flex-col px-4 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[13rem] lg:px-6 lg:py-6">
        <div>
          <a
            href={rootUrl(host)}
            className="heading-32 link-glow inline-block"
          >
            Linda Xue
          </a>

          <nav className="mt-8 hidden flex-col gap-2 lg:flex">
            {nav.map((item) => (
              <a
                key={item.section}
                href={subdomainUrl(host, item.section)}
                className="label-14 link-glow"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden lg:mt-auto lg:block lg:pt-12">
          <SocialLinks />
        </div>
      </aside>

      {/* Mobile: nav lives in a fixed bar along the bottom edge. */}
      {/* Height is exactly what the body reserves (3rem + safe-area inset),
          so the bar's top rule always meets the page content (the home photo
          locks its bottom edge here). Links center in the 3rem row above the
          safe area. The ::after is a background bleed below the bar: iOS 26
          Safari can leave a sliver of document visible between a fixed
          bottom:0 element and its toolbar (the page extends behind the
          toolbar under viewport-fit=cover while fixed elements are clamped
          above it), so paint that gap as the bar instead of page content. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(3rem+env(safe-area-inset-bottom))] border-t border-border bg-background pb-[env(safe-area-inset-bottom)] after:absolute after:inset-x-0 after:top-full after:h-24 after:bg-background lg:hidden"
      >
        <a
          href={rootUrl(host)}
          className="label-14 link-glow flex flex-1 items-center justify-center"
        >
          home
        </a>
        {nav.map((item) => (
          <a
            key={item.section}
            href={subdomainUrl(host, item.section)}
            className="label-14 link-glow flex flex-1 items-center justify-center"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
