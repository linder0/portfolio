import type { Metadata } from "next";
import { Suspense } from "react";
import GalleryView from "@/components/views/GalleryView";

export const metadata: Metadata = {
  title: "Gallery — Linda Xue",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-theme" />}>
      <GalleryView />
    </Suspense>
  );
}
