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
  // A paragraph starting "# " renders as a section heading; **text** bolds,
  // *text* italicizes, ***text*** does both (⌘B/⌘I in the editor).
  // The static value here is the default — the owner can rewrite it inline,
  // which stores an override in Blob (see `lib/post-store`).
  body: string;
  // Drafts are only visible to the signed-in owner — hidden from the index
  // and 404 on the post page for visitors.
  draft?: boolean;
};

export const posts: Post[] = [
  {
    id: "vroom",
    slug: "vroom",
    title: "VROOM Postmortem: What We Got Wrong About Events",
    date: "2026-07-05",
    tagline: "On trust, coordination, and four months in the events industry",
    body: [
      "# Intro and Whitepaper Recap",
      "At the start of this year, I was obsessed with one question: why do tech companies pour so much money into catering, venues, and staffing when the ROI looks trivial?",
      "After talking to various event planners and organizers in New York City, we concluded that repeat organizers had built a network of venues and vendors, along with a custom workflow for hosting repeat events in various formats. That led to the thesis that the private “operating system” experienced planners carry in their heads could be externalized as a data layer (the VRM, or Venue/Vendor Relationship Manager) and sold as infrastructure. The goal was to start with event coordination and then expand into venue sourcing and ticketing, eventually eating the entire ecosystem, which we had calculated to be a $90B+ TAM.",
      "The whole thing rested on two assumed problems:",
      "1. Venues and vendors maintain information asymmetry around availability, pricing, and terms to preserve pricing power and control demand.",
      "2. Coordination between providers is bottlenecked by single-channel communication.",
      "And so, the next 4 months began with that thesis in hand.",
      "# How Shit Actually Works",
      "We decided to begin with startup events (dinners, mixers, launch parties), as that market was most immediately accessible. It was here that both of our founding problems fell apart almost immediately, which forced the first pivot.",
      "**Information Asymmetry**",
      "Pricing isn’t hidden or meticulously planned to extract as much as possible; it’s just constrained, as every provider in the ecosystem must maintain comparable pricing to offer services of similar quality. It was also apparent that vendors are seldom the bottleneck in bringing an event together, as most services are commoditized. If logistics don’t work for one vendor, another is almost always available with enough lead time. The information asymmetry problem is also about repeatability and optics: venues and vendors want to work with you if you will be a returning customer and leverage their branding. TLDR of the events industry: every player just wants to look good and make money.",
      "“Information asymmetry” is really just our attempt to compartmentalize the nuances of a trust relationship between the provider (venue or vendor) and the host.",
      "**Coordination Bottleneck**",
      "Coordination between providers isn’t bottlenecked by single-channel comms. It’s just not hard. With commoditized vendors and a bit of lead time, stitching providers together is logistics, not a moat.",
      "As it turned out, startups that wanted to work with us often didn’t have the budget for well-done events, and the startups and companies that did have a budget for events didn’t see value in us doing it more cheaply. That left us with the same issue: the market wasn’t responding to coordination, but to trust. We concluded that the easiest way to build that trust was to run our own events.",
      "Both problems pointed to the same thing: we were selling a fix for asymmetry and coordination, but the market asked: “Why should I trust you to pull this off?”",
      "# Trying to Manufacture Trust",
      "In an attempt to build trust, we decided that we would just have to throw our own events (see them at vroomevents.com). We threw a lot of small startup events and kept trying to climb into bigger corporate budgets. It was brutally hard to close, and we learned why: corporate events are bimodal. Either you have them, or you don’t. If you do, you have serious money to spend, which means you spend it on people you already trust. Nowadays and Boompop are deeply embedded in that scene, with years of reps under their belts. Without the proper corporate connections or age on our side, we were trying to speedrun the kind of credibility that accrues over years.",
      "# A Quick Detour to Ticketing",
      "So we pivoted to ticketing as another potential revenue stream. This is where we actually started to understand the real shape of the industry. Ticketing is usually the reward for supplying some other value to the host, and we assumed we might be able to provide that value via coordination. By looking at the complexity at each tier and the major players in each one, we saw where we could slot in — and why coordination wasn’t valuable on any tier.",
      "**Four Scales of Events** (and why an operational layer is not applicable to any of them):",
      "**1. Small, intimate gatherings** (e.g. dinners, card nights): One or two hosts, high participation, no profit goal. There’s nothing to coordinate that the host doesn’t already enjoy doing, and nothing to sell. The “work” is picking a date and time, so adding software would just complicate things, and people will be able to vibe code anything they need very easily in the future.",
      "**2. Indie producer events** (e.g. club nights, parties): These confirm the whitepaper’s core observation: producers build a tight, repeated circle of venues and vendors. The private OS is real. But the graph is the producer’s edge, so the people who own the valuable network guard it with their lives.",
      "**3. Corporate events** (Boom Pop, Nowadays): Corporate demand is bimodal. Companies either treat events as core to the business and hire in-house to run them, or don’t run them at all. There’s no middle population of firms that want to outsource event coordination to software. Thus, Boom Pop and Nowadays serve the repeatable, objective-oriented slice.",
      "**4. Large live events & festivals** (Live Nation): Too variable for repeatable software, and viability requires a full suite of offerings such as wristbands, distribution, ticketing, etc., not just coordination. Outside a handful of independently organized events, the category is consolidated under Live Nation. There’s no wedge here that isn’t a decade-long infrastructure build.",
      "This was unfortunately realized after we built out Vroom ticketing. To compete there, we’d have had to build a pile of software and services to take on incumbents who already bundle distribution and advertising.",
      "# The Deeper Errors",
      "The pivots were symptoms. Underneath them were three assumptions baked into the whitepaper that were just flat-out wrong, and each one pushed us toward the next move.",
      "**There was no wedge.** “Mid-sized events” with a budget of 3k to 200k are not a wedge; it’s more like a ball, maybe. We never defined the first sharp thing we were going to be undeniably best at. Honestly, this was probably fixable by just sitting with real events longer before writing a thesis about them. (lol.)",
      "**There was no network effect.** The expansion plan assumed the VRM data layer would compound: more events, more data, a stronger moat, fancy gestures to enrich the data graph, blah blah blah. But events data is short-lived; last quarter’s availability, pricing, and contacts decay almost immediately, so the “asset” you’re accumulating is mostly stale by the time you’d use it. And trust, the very thing that doesn’t decay, isn’t codifiable. You can’t store it in a database or harness it by noting that a dynamic exists; it just lives in a person’s reputation and relationships. So the data we could capture had no moat, and the moat we wanted couldn’t be captured as data.",
      "**The expansion plan assumed a lot.** Eat coordination, then sourcing, then ticketing… we had built the rungs of that ladder, assuming the previous one had built durable, transferable trust. None of it did.",
      "# What I Believe Now",
      "The real problem was never being deeply enough embedded in events. Everything else was downstream of that.",
      "**Trust cannot be outsourced.** It was the scarce resource the entire time, the one thing the planner’s OS actually runs on, and it’s the thing we kept trying to route around.",
      "**And, coordination is trivial.** If the host is particularly tech-savvy, they would probably know to connect Notion MCP to Claude, have it break down all the operational details, and then send texts or emails to everyone involved. I believe the gaps are mostly due to a lack of education.",
      "# What Now?",
      "As software becomes more and more accessible, it’s no longer worthwhile to build wrapper software. Once the tool is everywhere, what matters is knowing what to do with it. So the useful work isn’t building wrappers.",
      "The cultural problem underlying all of this remains real and worth solving: people genuinely want better ways to gather. As more of the economy gets automated and abundant post-AGI, the scarce things are human connection, physical presence, and trust between actual people.",
      "**Trust is everything.** We just spent four months trying to turn it into a database first.",
    ].join("\n\n"),
  },
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
   Body parsing — a post body is plain text: blank lines split paragraphs, a
   paragraph that is just an image URL renders as the image, and a paragraph
   starting "# " renders as a section heading. Parsed here so the server page
   and the inline editor agree on the format.
   ------------------------------------------------------------------------- */

export type PostBlock =
  | { kind: "text"; text: string }
  // A section heading: "# Heading" (extra #s collapse — the site has one
  // heading style, so there are no levels to encode).
  | { kind: "heading"; text: string }
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

// A heading paragraph: one or more #s, a space, then the heading text.
const HEADING_CHUNK = /^#+\s+(.*)$/;

export function postBlocks(body: string): PostBlock[] {
  return splitChunks(body).map((chunk) => {
    const image = parseImageChunk(chunk);
    if (image) return { kind: "image", ...image } as const;
    const text = chunk.replace(/\s*\n\s*/g, " ");
    const heading = text.match(HEADING_CHUNK);
    if (heading) return { kind: "heading", text: heading[1] } as const;
    return { kind: "text", text } as const;
  });
}

/* ---------------------------------------------------------------------------
   Inline formatting — asterisk runs inside a paragraph: **bold**, *italic*,
   ***both***. The markers are stripped for visitors; a run whose closing
   marker doesn't match is left as literal text.
   ------------------------------------------------------------------------- */

export type TextSegment = { text: string; bold: boolean; italic: boolean };

// A marker run and its matching closer: * / ** / *** with no stars inside.
const MARKED = /(\*{1,3})([^*]+)\1/g;

export function textSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const plain = (t: string) => ({ text: t, bold: false, italic: false });
  let cursor = 0;
  for (const match of text.matchAll(MARKED)) {
    if (match.index > cursor) {
      segments.push(plain(text.slice(cursor, match.index)));
    }
    const stars = match[1].length;
    segments.push({
      text: match[2],
      bold: stars >= 2,
      italic: stars % 2 === 1,
    });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    segments.push(plain(text.slice(cursor)));
  }
  return segments;
}

// The text as visitors see it — formatting markers removed.
export function stripMarkers(text: string): string {
  return textSegments(text)
    .map((s) => s.text)
    .join("");
}

// The first text paragraph, for previews (formatting markers stripped).
export function postExcerpt(body: string): string | undefined {
  const block = postBlocks(body).find((b) => b.kind === "text");
  return block?.kind === "text" ? stripMarkers(block.text) : undefined;
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
