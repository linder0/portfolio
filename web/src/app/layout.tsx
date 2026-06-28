import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { PanelProvider } from "@/lib/panel-context";
import Header from "@/components/Header";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Linda Xue",
  description:
    "My worst fear is to be categorizable — but if you must: I'm Linda. I study CS + Neuro and Design at MIT but I'm currently on leave building after YC F25.",
  icons: {
    icon: "/favicon.svg",
  },
};

// Set theme before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sourceSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <PanelProvider>
            <Header />
            {children}
          </PanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
