"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-background text-foreground">
        <main className="p-frame lg:p-gutter">
          <div className="max-w-measure">
            <p className="label-eyebrow">Error</p>
            <h1 className="heading-48 mt-4">Something went wrong</h1>
            <p className="copy-18 mt-6">
              The site could not be loaded. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="copy-16 link-glow mt-8"
            >
              Try again →
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
