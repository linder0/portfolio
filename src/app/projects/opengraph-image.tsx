import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderSectionOg,
} from "@/lib/og-image";

export const alt = "Projects — Linda Xue";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderSectionOg("Projects", "Selected work by Linda Xue.");
}
