const socials = [
  { label: "Email", href: "mailto:xuelinda7@gmail.com" },
  { label: "X", href: "https://x.com/xuelinda7" },
  { label: "LinkedIn", href: "https://linkedin.com/in/lindalxue" },
  { label: "Instagram", href: "https://instagram.com/_lindaxue" },
  { label: "TikTok", href: "https://tiktok.com/@greenteaslurper" },
  { label: "Spotify", href: "https://open.spotify.com/artist/0BtCnaxMvgGy54GU3RRhJq" },
];

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Linda Xue
      </h1>

      <p className="mt-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        Rebuilding in progress
      </p>

      <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition-opacity hover:opacity-60"
          >
            {social.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
