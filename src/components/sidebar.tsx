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
      {/* Mobile: just the masthead (tag) up top. Desktop: the full fixed
          rail with nav + socials. The rail is a grid region — frame inset +
          column 1 (w-rail = 6rem); no right padding, so its usable box
          ends exactly on column 1's right edge and PageMain's own padding
          supplies the gutter to the content pane. */}
      <aside className="flex flex-col p-frame lg:fixed lg:inset-y-0 lg:left-0 lg:w-rail lg:pr-0">
        <div>
          {/* Masthead: the signature tag, doubling as the home button. It
              overshoots the shared frame inset with negative margins (sitting
              8px off the page's top edge) so the mark reads big without
              moving the rail's alignment for everything below it. */}
          <a
            href={rootUrl(host)}
            aria-label="Linda Xue, home"
            title="Home"
            className="shape-glow-trigger -mt-2 -ml-1 inline-block transition-transform duration-200 ease-out hover:scale-105 lg:-ml-2"
          >
            <span
              aria-hidden="true"
              className="shape-glow block h-16 w-16 select-none bg-foreground lg:h-24 lg:w-24"
              style={{
                WebkitMaskImage: "url(/tag.png)",
                maskImage: "url(/tag.png)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "left center",
                maskPosition: "left center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </a>

          <nav
            aria-label="Primary"
            className="mt-4 hidden flex-col gap-2 lg:flex"
          >
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
      {/* The bar's top rule sits exactly 3rem + safe-area above the viewport
          bottom — the same space the body reserves — so it always meets the
          page content (the home photo locks its bottom edge here). Links
          center in the 3rem row at the top of the bar.

          The bar's own box then overshoots 4rem BELOW the viewport bottom:
          iOS 26 Safari (Liquid Glass) can expose a sliver of the document
          between a bottom-anchored fixed element and its toolbar, and its
          toolbar compositing ignores ::before/::after — it only honors the
          fixed element's own background-color. The oversized box paints that
          gap as bar background and gives Safari the right color to sample
          for toolbar tinting. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 -bottom-16 z-40 flex h-[calc(7rem+env(safe-area-inset-bottom))] border-t border-border bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden"
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
