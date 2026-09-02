import Link from "next/link";
import { PageMain } from "@/components/page-main";

export default function NotFound() {
  return (
    <PageMain>
      <div className="max-w-measure">
        <p className="label-eyebrow">404</p>
        <h1 className="heading-48 mt-4">Page not found</h1>
        <p className="copy-18 mt-6">
          This page may have moved or no longer exists.
        </p>
        <Link href="/" className="copy-16 link-glow mt-8 inline-block">
          Return home →
        </Link>
      </div>
    </PageMain>
  );
}
