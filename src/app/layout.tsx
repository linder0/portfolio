import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MarginProvider, Marginalia } from "@/components/marginalia";
import { AnnotationCapture } from "@/components/annotation-capture";
import { GridOverlay } from "@/components/grid-overlay";
import { isAuthenticated } from "@/lib/auth";

const serif = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-google",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lindaxue.com"),
  title: "Linda Xue",
  description: "my piece of digital real estate",
  // No explicit title/description here: pages that inherit this block get
  // their own title/description in the og: tags (iMessage etc. read og:title
  // over <title>, so hard-coding it would mislabel every section page).
  openGraph: {
    siteName: "Linda Xue",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const canEdit = await isAuthenticated();

  return (
    // The site is always dark — the `dark` class is baked into the markup
    // (no toggle, no OS preference, no pre-paint script).
    <html lang="en" className={`${serif.variable} dark h-full antialiased`}>
      {/* Header / content / footer, and the whole page scrolls normally on
          every breakpoint. The flex column pins the footer to the viewport
          bottom on short pages (content stretches via flex-1). Overscroll
          rubber-banding is intentionally left on; the grain layers overshoot
          the viewport so bounced edges stay textured. */}
      <body className="flex min-h-dvh flex-col pb-[env(safe-area-inset-bottom)]">
        <MarginProvider canEdit={canEdit}>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <Marginalia />
          <AnnotationCapture />
          {/* Press "g" for the column-grid overlay: anyone in dev, owner
              only on prod. */}
          {(process.env.NODE_ENV === "development" || canEdit) && (
            <GridOverlay />
          )}
        </MarginProvider>
      </body>
    </html>
  );
}
