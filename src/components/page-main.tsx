import { cn } from "@/lib/utils";

// The shared content frame every page sits in: full width with the standard
// inset that matches the sidebar's own padding rhythm. Keeps the one gutter
// value in a single place instead of copy-pasted across pages.
// It's also a CSS container (@container), so children capped to the reading
// measure can break back out to the pane's inner width with 100cqw — that's
// how full-pane frame images escape the measure (see FrameImage).
export function PageMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn("@container w-full px-4 py-4 lg:px-6 lg:py-6", className)}
    >
      {children}
    </main>
  );
}
