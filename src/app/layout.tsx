import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MarginProvider, Marginalia } from "@/components/marginalia";
import { AnnotationCapture } from "@/components/annotation-capture";
import { GridOverlay } from "@/components/grid-overlay";
import { isAuthenticated } from "@/lib/auth";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk-google",
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

// Let the page extend under the home-indicator area so the bottom nav bar's
// env(safe-area-inset-bottom) padding takes effect on notched phones.
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
    <html lang="en" className={`${grotesk.variable} dark h-full antialiased`}>
      {/* Mobile: a min-h-dvh flex column reserving exactly the fixed nav
          bar's height (h-12 + safe area) at the bottom. Desktop clears the
          bar via the fixed rail. */}
      <body className="flex min-h-dvh flex-col pb-[calc(3rem+env(safe-area-inset-bottom))] lg:block lg:h-dvh lg:overflow-hidden lg:pb-0">
        <MarginProvider canEdit={canEdit}>
          <div className="flex flex-1 flex-col lg:block lg:h-dvh">
            <Sidebar />
            {/* Content column: cleared past the fixed rail on the left (page
                inset + grid column 1), and inset on the right by the
                marginalia region (span-3 panel + the page inset), so with
                PageMain's own padding a single gutter separates content from
                each flank. Both insets are grid tokens — see globals.css. */}
            <div className="flex flex-1 flex-col lg:block lg:h-dvh lg:overflow-y-auto lg:pl-rail lg:pr-margin-pane">
              {children}
            </div>
          </div>
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
