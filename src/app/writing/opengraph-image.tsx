import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderSectionOg,
} from "@/lib/og-image";

export const alt = "Writing — Linda Xue";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderSectionOg("Writing", "Notes and writing by Linda Xue.");
}
