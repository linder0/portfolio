const socials: { label: string; href: string }[] = [
  { label: "Email", href: "mailto:xuelinda7@gmail.com" },
  { label: "X", href: "https://x.com/xuelinda7" },
  { label: "Instagram", href: "https://instagram.com/_lindaxue" },
  { label: "LinkedIn", href: "https://linkedin.com/in/lindalxue" },
  { label: "TikTok", href: "https://tiktok.com/@greenteaslurper" },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/0BtCnaxMvgGy54GU3RRhJq",
  },
  { label: "Substack", href: "https://substack.com/@lindaxue" },
  { label: "Letterboxd", href: "https://letterboxd.com/xueli21" },
];

export function SocialLinks({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <nav
      aria-label="Social links"
      className={
        horizontal
          ? "flex flex-wrap gap-x-5 gap-y-2"
          : "flex flex-col-reverse items-start gap-1"
      }
    >
      {socials.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="copy-14 link-glow text-foreground"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
