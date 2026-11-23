"use client";

import { PageMain } from "@/components/page-main";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PageMain>
      <div className="max-w-measure">
        <p className="label-eyebrow">Error</p>
        <h1 className="heading-48 mt-4">Something went wrong</h1>
        <p className="copy-18 mt-6">
          The page could not be loaded. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="copy-16 link-glow mt-8"
        >
          Try again →
        </button>
      </div>
    </PageMain>
  );
}
