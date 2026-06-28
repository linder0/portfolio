import type { IconType } from "react-icons";
import {
  FaEnvelope,
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaTiktok,
  FaSpotify,
} from "react-icons/fa6";

const socials: { label: string; href: string; Icon: IconType }[] = [
  { label: "Email", href: "mailto:xuelinda7@gmail.com", Icon: FaEnvelope },
  { label: "X", href: "https://x.com/xuelinda7", Icon: FaXTwitter },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/lindalxue",
    Icon: FaLinkedinIn,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/_lindaxue",
    Icon: FaInstagram,
  },
  { label: "TikTok", href: "https://tiktok.com/@greenteaslurper", Icon: FaTiktok },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/0BtCnaxMvgGy54GU3RRhJq",
    Icon: FaSpotify,
  },
];

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Linda Xue
      </h1>

      <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        Rebuilding in progress
      </p>

      <nav className="mt-12 flex flex-wrap items-center justify-center gap-6">
        {socials.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="text-muted-foreground transition-opacity hover:opacity-60"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </nav>
    </main>
  );
}
