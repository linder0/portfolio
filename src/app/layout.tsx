import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linda Xue",
  description: "Linda Xue — portfolio rebuilding in progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
