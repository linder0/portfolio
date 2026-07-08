import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderSectionOg,
} from "@/lib/og-image";

export const alt = "Playground — Linda Xue";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderSectionOg("Playground", "Experiments, embeds, and things in progress.");
}
