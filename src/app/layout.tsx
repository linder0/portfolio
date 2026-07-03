import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { SignatureTag } from "@/components/signature-tag";
import { MarginProvider, Marginalia } from "@/components/marginalia";
import { AnnotationCapture } from "@/components/annotation-capture";
import { isAuthenticated } from "@/lib/auth";

const serif = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-google",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lindaxue.com"),
  title: "Linda Xue",
  description: "Linda Xue — designer and developer.",
};

// Let the page extend under the home-indicator area so the bottom nav bar's
// env(safe-area-inset-bottom) padding takes effect on notched phones.
export const viewport: Viewport = {
  viewportFit: "cover",
};

// Set the theme before paint to avoid a flash of the wrong color scheme.
// Sections live on separate subdomains (separate origins), so the preference is
// shared two ways: a cookie scoped to the parent domain (works in production)
// and a `?theme=` URL param carried across cross-subdomain nav (works in dev on
// *.localhost, where browsers reject a shared cookie). Priority:
// URL param > cookie > legacy localStorage > OS preference.
const themeInit = `(function(){try{var p=new URLSearchParams(location.search).get('theme');var t=(p==='dark'||p==='light')?p:null;if(!t){var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);t=m?decodeURIComponent(m[1]):null;}if(!t){try{t=localStorage.getItem('theme');}catch(e){}}var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);if(p){try{localStorage.setItem('theme',d?'dark':'light');}catch(e){}var u=new URL(location.href);u.searchParams.delete('theme');history.replaceState(null,'',u.pathname+u.search+u.hash);}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const canEdit = await isAuthenticated();

  return (
    <html
      lang="en"
      className={`${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      {/* Mobile: a min-h-dvh flex column reserving exactly the fixed nav
          bar's height (h-12 + safe area) at the bottom. Overscroll
          rubber-banding is intentionally left on; the grain overlay
          overshoots the viewport so bounced edges stay textured. Desktop
          clears the bar via the fixed rail. */}
      <body className="flex min-h-dvh flex-col pb-[calc(3rem+env(safe-area-inset-bottom))] lg:block lg:h-dvh lg:overflow-hidden lg:pb-0">
        <MarginProvider canEdit={canEdit}>
          <SignatureTag />
          <div className="flex flex-1 flex-col lg:block lg:h-dvh">
            <Sidebar />
            {/* Content column: cleared past the fixed rail on the left, and
                inset on the right by exactly the marginalia pane width (1.5rem
                inset + 19rem panel = 20.5rem) so the content butts right up to
                it with only the shared inset as the gutter. */}
            <div className="flex flex-1 flex-col lg:block lg:h-dvh lg:overflow-y-auto lg:pl-[13rem] lg:pr-[20.5rem]">
              {children}
            </div>
          </div>
          <Marginalia />
          <AnnotationCapture />
        </MarginProvider>
      </body>
    </html>
  );
}
