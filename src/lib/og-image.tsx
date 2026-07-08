import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared Open Graph banner for the section landing pages (projects., writing.,
// playground.). Rendered from the brand tokens so link previews match the site
// instead of falling back to the favicon. See design.md / globals.css.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#f6f5f2"; // page surface
const INK = "#0b0b0b"; // primary text
const PINE = "#324b34"; // the one accent
const MUTED = "rgba(11,11,11,0.62)"; // secondary text
const HAIRLINE = "rgba(11,11,11,0.14)"; // border token

// Newsreader (the site's title serif) is the only face satori has to work
// with, so the whole composition is serif — on brand, since titles are serif.
let fontPromise: Promise<Buffer> | null = null;
function serifFont(): Promise<Buffer> {
  fontPromise ??= readFile(
    join(process.cwd(), "assets/Newsreader-Regular.ttf"),
  );
  return fontPromise;
}

export async function renderSectionOg(
  section: string,
  tagline: string,
): Promise<ImageResponse> {
  const serif = await serifFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: 80,
          fontFamily: "Newsreader",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, letterSpacing: "-0.3px" }}>
          Linda Xue
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: "-3px",
            }}
          >
            {section}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              maxWidth: 860,
              fontSize: 36,
              lineHeight: 1.25,
              color: MUTED,
            }}
          >
            {tagline}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              height: 1,
              background: HAIRLINE,
              marginBottom: 26,
            }}
          />
          <div style={{ display: "flex", fontSize: 27, color: PINE }}>
            {section.toLowerCase()}.lindaxue.com
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Newsreader", data: serif, style: "normal", weight: 400 },
      ],
    },
  );
}
