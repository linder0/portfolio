import { VIDEO_URL } from "@/lib/writing";
import { RawImage } from "@/components/raw-image";

export function RowMedia({
  src,
  className,
  style,
  draggable,
  onIntrinsicSize,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
  // Intrinsic pixel size, once the file's metadata is in (justified rows).
  onIntrinsicSize?: (width: number, height: number) => void;
}) {
  const report = (width: number, height: number) => {
    if (width && height) onIntrinsicSize?.(width, height);
  };

  if (VIDEO_URL.test(src)) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className={className}
        style={style}
        onLoadedMetadata={(e) =>
          report(e.currentTarget.videoWidth, e.currentTarget.videoHeight)
        }
        ref={(el) => {
          if (el?.videoWidth) report(el.videoWidth, el.videoHeight);
        }}
      />
    );
  }
  return (
    <RawImage
      src={src}
      className={className}
      style={style}
      draggable={draggable}
      onLoad={(e) =>
        report(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)
      }
    />
  );
}
