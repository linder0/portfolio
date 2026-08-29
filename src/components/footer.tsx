import { socials } from "@/components/social-links";

// The site footer, opened by the one hairline rule: the name on the left,
// every link in columns, and the contact line with the email on the right
// (so "Email" is dropped from the columns — the address itself lives here).
export function Footer() {
  const links = socials.filter((social) => social.label !== "Email");

  return (
    <footer className="border-t border-border px-4 py-10 lg:px-6 lg:py-12">
      <div className="flex flex-col gap-y-10 lg:flex-row lg:items-start lg:justify-between lg:gap-x-12">
        <p className="heading-24">Linda Xue</p>

        <nav
          aria-label="Social links"
          className="grid grid-cols-2 gap-x-12 gap-y-2 lg:gap-x-16"
        >
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="copy-14 link-glow"
            >
              {label} ↗
            </a>
          ))}
        </nav>

        <div className="space-y-1">
          <p className="copy-16">Let’s build something together.</p>
          <a
            href="mailto:xuelinda7@gmail.com"
            className="copy-16 link-glow underline decoration-dotted underline-offset-4"
          >
            xuelinda7@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
