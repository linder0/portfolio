export type Post = {
  // Stable identity for owner edits stored in Blob (see `lib/post-store`).
  // Never changes — the slug can.
  id: string;
  // The post's URL: `/writing/<slug>` (writing.lindaxue.com/<slug>). Any
  // string works — keep it short (e.g. "beacon").
  slug: string;
  title: string;
  // Machine-readable date for sorting/metadata (YYYY-MM-DD).
  date: string;
  // Short one-liner for the index row and link previews.
  tagline: string;
  // Optional thumbnail, shown on the index row, the hover note, and link
  // previews. A path under /public (e.g. "/images/posts/beacon.png") or an
  // uploaded image ("/api/images/<name>").
  thumbnail?: string;
  // Vertical focal point for the banner's 3:1 crop, 0 (top) – 100 (bottom).
  // Omitted = 50 (center). Set by dragging the preview in the post editor.
  thumbnailY?: number;
  // Body copy. Blank lines separate paragraphs; a line that is just an image
  // URL renders as the image itself (same convention as marginalia notes).
  // The static value here is the default — the owner can rewrite it inline,
  // which stores an override in Blob (see `lib/post-store`).
  body: string;
  // Drafts are only visible to the signed-in owner — hidden from the index
  // and 404 on the post page for visitors.
  draft?: boolean;
};

export const posts: Post[] = [
  {
    id: "beacon",
    slug: "beacon",
    title: "Building my Beacon",
    date: "2026-07-01",
    tagline: "On Minecraft, emergence, and finding the plot",
    body: [
      "The beacon has been my latest metaphorical fascination.",
      "To build a beacon in Minecraft, all you need is to kill a wither, obtain its star, put some glass and obsidian around it, and you get a nice little block that does nothing. To activate it, you must build a pyramid of precious ore blocks (iron, gold, diamond, emerald, or netherite) beneath it, with the side length increasing by two for each additional layer, up to a maximum of four layers. It doesn’t matter what ores are in each layer, just that they are solid. Each layer gives you increasing buffs - pretty awesome.",
      "I think this is a beautiful analogy to early adulthood (in my case, the ripe age of 19). When life comes knocking at your doorstep with the inevitable question of “what is the plot?” it’s hard to find an answer worth defending. I think about my plot quite frequently, and having founded two failed companies in less than 12 months and finding myself extremely lost after feeling extremely convinced makes me think a lot about how I choose to activate my beacons - or what I even understand a beacon to be.",
      "I first coined the term while tripping balls at the Golden Gate Vista Overlook, staring very closely at the minerals embedded in the bunkers' concrete. I couldn’t stop thinking about how everything was the same thing, over and over again. At the time, I just kept repeating that “EVERYTHING IS RECURSIVE!” but upon further deliberation with friends who are more frequent trippers, I realize that I was just first-principling emergence. Over the course of two hours, my mind inevitably wandered to the fact that I was founding, and I started thinking about how our body is composed of atoms that assemble into molecules, which assemble into proteins, into organelles, into cells, into tissues, into organs, into systems, into humans, into teams, into… companies.",
      "Holy fucking shit, everything is a company.",
      "I see now, writing this all down, that the logic that ensued is a bit unfounded, but the point is that I realized that organization is emergent and that attention really is everything. So now we come to the concept of the beacon. I realized that all systems are organized around certain beacons, and the members of those systems answer to the beacons' pings and, in return, are buffed by them, whether through energy, capital, purpose, status, etc. So I concluded that to build a great company, I would have to build a wonderful beacon that would ping as many people as possible.",
      "Today, I had a conversation with someone from FR8 about the goal of education. We both agreed that in an ideal world, education allows people to find their beacon: to defeat the wither and gather enough understanding to start building out the base. And that, in order to allow young people to bend reality in their image, we must enable as many beacons as possible. He told me that he was looking for young people with crazy ideas, “the crazier the better,” he says. It seemed ridiculous to me that anyone really young would be able to know for sure what they wanted, and I guess I was just a bit jaded from my misguided conviction, but after a bit of back and forth, I believe his hypothesis is worth a shot.",
      "The beacon itself is nothing without a base. I suppose that’s the whole point. It doesn’t really matter what your first layer is made of; it could be netherite, but functionally it will provide the same utility as nine blocks of iron. But if you stick with it and build a four-layer beacon from iron, you can gradually rebuild it with better ore - OR you can add more beacons with less ore!",
      "The way I understand it, in the past I’ve hastily built one-layer beacons and found security in knowing I had the beacon in place. It turns out that one-layer beacons, no matter what the material, are still very easily accessible by creepers, and the beacon block itself is not durable at all.",
      "The realization here is that I would like to spend some time really building out my beacon; I would like to max it out and be truly great at something I commit to. Maybe then, my beacon can also buff other players who choose to join me on my quest. I think that would be quite cool!",
    ].join("\n\n"),
  },
];

/* ---------------------------------------------------------------------------
   Body parsing — a post body is plain text: blank lines split paragraphs, and
   a paragraph that is just an image URL renders as the image. Parsed here so
   the server page and the inline editor agree on the format.
   ------------------------------------------------------------------------- */

export type PostBlock =
  | { kind: "text"; text: string }
  // Width in px (owner-resized; omitted = natural size, capped to the column).
  | { kind: "image"; src: string; width?: number };

// An image URL: absolute, root-relative (a file under /public), or an
// owner-uploaded image served from /api/images/[name] (see `lib/post-store`).
// Shared with the marginalia note renderer, which uses the same convention.
export const IMAGE_URL =
  /^((https?:\/\/|\/)\S+\.(png|jpe?g|gif|webp|avif|svg)(\?\S*)?|\/api\/images\/[\w.-]+)$/i;

// A body's paragraphs (text chunks and image lines), split on blank lines.
// The inline editors round-trip bodies through this same split.
export function splitChunks(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

// An image paragraph is the URL alone, optionally followed by a pixel width
// ("<url> 420") written by the inline resize handles.
export function parseImageChunk(
  chunk: string,
): { src: string; width?: number } | null {
  const match = chunk.trim().match(/^(\S+)(?:\s+(\d+))?$/);
  if (!match || !IMAGE_URL.test(match[1])) return null;
  return {
    src: match[1],
    width: match[2] ? Number(match[2]) : undefined,
  };
}

export function postBlocks(body: string): PostBlock[] {
  return splitChunks(body).map((chunk) => {
    const image = parseImageChunk(chunk);
    if (image) return { kind: "image", ...image } as const;
    return {
      kind: "text",
      text: chunk.replace(/\s*\n\s*/g, " "),
    } as const;
  });
}

// The first text paragraph, for previews.
export function postExcerpt(body: string): string | undefined {
  const block = postBlocks(body).find((b) => b.kind === "text");
  return block?.kind === "text" ? block.text : undefined;
}

// "2026-07-01" -> "July 1, 2026".
export function formatPostDate(post: Post): string {
  const [year, month, day] = post.date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
