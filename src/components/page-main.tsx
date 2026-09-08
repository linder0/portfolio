import { cn } from "@/lib/utils";

// The shared content frame every page sits in: the frame inset (p-frame) on
// every edge, except on lg where the horizontal padding is a full gutter —
// there the left pad is the gutter between the rail's column and the content
// text, and the right pad the gutter before the marginalia panel.
// It's also a CSS container (@container), so children capped to the reading
// measure can break back out to the pane's inner width with 100cqw — that's
// how full-pane frame images escape the measure (see FrameImage).
export function PageMain({
  children,
  className,
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <main
      data-full-width={fullWidth || undefined}
      className={cn(
        "@container w-full p-frame lg:px-gutter",
        // Reclaim the note column; the exposed screen edge uses the frame
        // inset while the rail-to-content gap stays a full gutter.
        fullWidth && "lg:w-auto lg:-mr-margin-pane lg:pr-frame",
        className,
      )}
    >
      {children}
    </main>
  );
}
