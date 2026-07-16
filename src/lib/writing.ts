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
  // URL renders as the image itself (same convention as marginalia notes),
  // and lines under the URL in the same paragraph are the image's caption.
  // Block syntax: "# " section heading, "## " subheading, "- "/"* "/"1. "
  // list lines, "> " blockquote, ``` fenced code, "---" horizontal rule.
  // Inline: **bold**, *italic*, ***both*** (nesting works), ~~strike~~,
  // `code`, [text](url) links and bare URLs (⌘B/⌘I/⌘K in the editor).
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
      "We decided to begin with startup events (dinners, mixers, launch parties), as that market was most immediately accessible. It was here that both of our founding problems fell apart almost immediately.",
      "**Information Asymmetry**",
      "Pricing isn’t hidden or meticulously planned to extract as much as possible; it’s just constrained, as every provider in the ecosystem must maintain comparable pricing to offer services of similar quality. It was also apparent that vendors are seldom the bottleneck in bringing an event together, as most services are commoditized. If logistics don’t work for one vendor, another is almost always available with enough lead time. The information asymmetry problem is also about repeatability and optics: venues and vendors want to work with you if you will be a returning customer and leverage their branding. TLDR of the events industry: every player just wants to look good and make money.",
      "“Information asymmetry” was really just our attempt to compartmentalize the nuances of a trust relationship between the provider (venue or vendor) and the host.",
      "**Coordination Bottleneck**",
      "Coordination between providers isn’t bottlenecked by single-channel comms. It’s just not hard. Once you know which vendors and have a bit of lead time, stitching providers together is simple.",
      "As it turned out, startups that wanted to work with us often didn’t have the budget for well-done events, and the startups and companies that did have a budget for events didn’t see value in us doing it more cheaply. That left us with the same issue: the market wasn’t responding to coordination, but to trust. We concluded that the easiest way to build that trust was to run our own events.",
      "# Trying to Manufacture Trust",
      "In an attempt to build trust, we decided that we would just have to throw our own events (see them at vroomevents.com). We threw a lot of small startup events and kept trying to climb into bigger corporate budgets. It was brutally hard to close, and we learned why: corporate events are bimodal. Either you have them, or you don’t. If you do, you have serious money to spend, which means you spend it on people you already trust. Nowadays and Boompop are deeply embedded in that scene. Without the proper corporate connections or age on our side, we were trying to speedrun the kind of credibility that accrues over years.",
      "# A Quick Detour to Ticketing",
      "So we pivoted to ticketing as another potential revenue stream. This is where we actually started to understand the real shape of the industry. Ticketing is usually the reward for supplying some other value to the host, and we assumed we might be able to provide that value via coordination. By looking at the complexity at each tier and the major players in each one, we saw why coordination wasn’t valuable on any tier.",
      "**Four Scales of Events**",
      "**1. Small, intimate gatherings** (e.g. dinners, card nights): One or two hosts, high participation, no profit goal. There’s nothing to coordinate that the host doesn’t already enjoy doing, and nothing to sell. The “work” is picking a date and time, so adding software would just complicate things, and people will be able to vibe code anything they need very easily in the future.",
      "**2. Indie producer events** (e.g. club nights, parties): These confirm the whitepaper’s core observation: producers build a tight, repeated circle of venues and vendors. The private OS is real. But the graph is the producer’s edge, so the people who own the valuable network guard it with their lives.",
      "**3. Corporate events** (Boom Pop, Nowadays): Corporate demand is bimodal. Companies either treat events as core to the business and hire in-house to run them, or don’t run them at all. There’s no middle population of firms that want to outsource event coordination to software. Thus, Boom Pop and Nowadays serve the repeatable, objective-oriented slice.",
      "**4. Large live events & festivals** (Live Nation): Too variable for repeatable software, and viability requires a full suite of offerings such as wristbands, distribution, ticketing, etc., not just coordination. Outside a handful of independently organized events, the category is consolidated under Live Nation. There’s no wedge here that isn’t a decade-long infrastructure build.",
      "This was unfortunately realized after we built out Vroom ticketing. To compete there, we’d have had to build a pile of software and services to take on incumbents who already bundle distribution and advertising.",
      "# The Deeper Errors",
      "**There was no wedge.** We originally identified a target of “Mid-sized events” with a budget of 3k to 200k as our wedge; it’s more like a ball, maybe. Honestly, this was probably fixable by just sitting with real events longer before writing a thesis about them. (lol.)",
      "**There was no network effect.** The expansion plan assumed the VRM data layer would compound: more events, more data, a stronger moat, fancy gestures to enrich the data graph, blah blah blah. But events data is short-lived; last quarter’s availability, pricing, and contacts decay almost immediately, so the “asset” you’re accumulating is mostly stale by the time you’d use it. And trust, the very thing that doesn’t decay, isn’t codifiable. You can’t store it in a database or harness it by noting that a dynamic exists; it just lives in a person’s reputation and relationships. So the data we could capture had no moat, and the moat we wanted couldn’t be captured as data.",
      "**The expansion plan assumed a lot.** Eat coordination, then sourcing, then ticketing… we had built the rungs of that ladder, assuming the previous one had built durable, transferable trust. None of it did.",
      "# What I Believe Now",
      "The real problem was never being deeply enough embedded in events. Everything else was downstream of that.",
      "**Trust cannot be outsourced.** It was the scarce resource the entire time, the one thing the planner’s OS actually runs on, and it’s the thing we kept trying to route around.",
      "**And, coordination is trivial.** If the host is particularly tech-savvy, they would probably know to connect Notion MCP to Claude, have it break down all the operational details, and then send texts or emails to everyone involved. I believe the gaps are mostly due to a lack of education.",
      "# What Now?",
      "As software becomes more and more accessible, it’s no longer worthwhile to build wrapper software. Once the tool is everywhere, what matters is knowing what to do with it.",
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
   paragraph that starts with an image URL renders as the image (any lines
   under the URL in the same paragraph are its caption), and chunks with a
   leading marker become structured blocks: "# "/"## " headings, "- "/"* "/
   "1. " lists, "> " blockquotes, ``` fenced code, "---" rules. Parsed here
   so the server page and the inline editor agree on the format.
   ------------------------------------------------------------------------- */

export type PostBlock =
  | { kind: "text"; text: string }
  // "# " is the section heading (level 2 — the page title is the only h1);
  // "## " and deeper collapse to a level-3 subheading (the site has two
  // in-body heading styles).
  | { kind: "heading"; level: 2 | 3; text: string }
  // Width in px (owner-resized; omitted = natural size, capped to the column).
  // Caption: any lines under the URL within the same paragraph.
  | { kind: "image"; src: string; width?: number; caption?: string }
  // Consecutive "- "/"* " (unordered) or "1. " (ordered) lines. A numbered
  // item in its own paragraph keeps its number via `start`, so the "1." /
  // "2." style with blank lines between items renders correctly.
  | { kind: "list"; ordered: boolean; start: number; items: string[] }
  | { kind: "quote"; text: string }
  // A ``` fenced chunk, verbatim (blank lines inside don't split it).
  | { kind: "code"; code: string }
  // "---" on its own paragraph.
  | { kind: "rule" };

// An image URL: absolute, root-relative (a file under /public), or an
// owner-uploaded image served from /api/images/[name] (see `lib/post-store`).
// Shared with the marginalia note renderer, which uses the same convention.
export const IMAGE_URL =
  /^((https?:\/\/|\/)\S+\.(png|jpe?g|gif|webp|avif|svg)(\?\S*)?|\/api\/images\/[\w.-]+)$/i;

// A body's paragraphs (text chunks and image lines), split on blank lines —
// except inside ``` fences, where blank lines belong to the code. The inline
// editors round-trip bodies through this same split.
export function splitChunks(body: string): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  const flush = () => {
    const chunk = current.join("\n").trim();
    if (chunk) chunks.push(chunk);
    current = [];
  };
  for (const line of body.split("\n")) {
    const fence = line.trim().startsWith("```");
    if (inFence) {
      current.push(line);
      if (fence) {
        inFence = false;
        flush();
      }
      continue;
    }
    if (fence) {
      flush();
      current.push(line);
      inFence = true;
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();
  return chunks;
}

// An image paragraph: the URL on its own line, optionally followed by a pixel
// width ("<url> 420") written by the inline resize handles. Lines under the
// URL within the same paragraph are the image's caption.
export function parseImageChunk(
  chunk: string,
): { src: string; width?: number; caption?: string } | null {
  const [first, ...rest] = chunk.trim().split("\n");
  const match = first.trim().match(/^(\S+)(?:\s+(\d+))?$/);
  if (!match || !IMAGE_URL.test(match[1])) return null;
  const caption = rest.join(" ").replace(/\s+/g, " ").trim();
  return {
    src: match[1],
    width: match[2] ? Number(match[2]) : undefined,
    ...(caption && { caption }),
  };
}

// A heading paragraph: one or more #s, a space, then the heading text.
const HEADING_CHUNK = /^(#+)\s+(.*)$/;

// A list line: "- ", "* ", or "1. " (the number is kept for ordered starts).
const LIST_LINE = /^([-*]|\d+\.)\s+(.*)$/;

// A fenced code chunk: the opening ``` (with an optional, ignored language
// tag) on the first line, verbatim lines after, an optional closing fence
// (an unclosed fence runs to the end of the chunk).
function parseCodeChunk(chunk: string): { code: string } | null {
  if (!chunk.startsWith("```")) return null;
  const lines = chunk.split("\n");
  let rest = lines.slice(1);
  if (rest.length && rest[rest.length - 1].trim() === "```") {
    rest = rest.slice(0, -1);
  }
  return { code: rest.join("\n") };
}

// A list chunk: the first line is a list item; further item lines start new
// items, and any non-item line continues the previous item (soft wrap).
function parseListChunk(
  chunk: string,
): { ordered: boolean; start: number; items: string[] } | null {
  const lines = chunk.split("\n").map((line) => line.trim());
  const first = lines[0].match(LIST_LINE);
  if (!first) return null;
  const ordered = first[1] !== "-" && first[1] !== "*";
  const items: string[] = [];
  for (const line of lines) {
    const item = line.match(LIST_LINE);
    if (item) items.push(item[2]);
    else if (items.length) items[items.length - 1] += ` ${line}`;
  }
  return { ordered, start: ordered ? parseInt(first[1], 10) : 1, items };
}

export function postBlocks(body: string): PostBlock[] {
  return splitChunks(body).map((chunk): PostBlock => {
    const code = parseCodeChunk(chunk);
    if (code) return { kind: "code", ...code };
    const image = parseImageChunk(chunk);
    if (image) return { kind: "image", ...image };
    if (/^-{3,}$/.test(chunk)) return { kind: "rule" };
    const list = parseListChunk(chunk);
    if (list) return { kind: "list", ...list };
    if (chunk.startsWith(">")) {
      // Each "> " line is its own line in the quote — join with newlines (and
      // collapse only within-line whitespace) so multi-line quotes keep their
      // breaks. The blockquote renders with whitespace-pre-line.
      const text = chunk
        .split("\n")
        .map((line) => line.trim().replace(/^>\s?/, "").replace(/\s+/g, " "))
        .join("\n")
        .trim();
      return { kind: "quote", text };
    }
    const text = chunk.replace(/\s*\n\s*/g, " ");
    const heading = text.match(HEADING_CHUNK);
    if (heading) {
      return {
        kind: "heading",
        level: heading[1].length === 1 ? 2 : 3,
        text: heading[2],
      };
    }
    return { kind: "text", text };
  });
}

/* ---------------------------------------------------------------------------
   Inline formatting — a small tokenizer over a paragraph's text: **bold**,
   *italic*, ***both*** (nesting works), ~~strike~~, `code`, [text](url)
   links, and bare URLs. Markers are stripped for visitors; an unmatched
   marker is left as literal text. Output is a flat list of styled segments
   whose `text` is exactly what renders, so highlight annotations (which
   match against rendered text) keep working per segment.
   ------------------------------------------------------------------------- */

export type TextSegment = {
  // The visible text (for a link, the label).
  text: string;
  bold: boolean;
  italic: boolean;
  strike: boolean;
  code: boolean;
  // Link destination, when the segment is (part of) a link's label.
  href?: string;
};

type InlineStyle = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  href?: string;
};

// Sticky (position-anchored) matchers for links and bare URLs.
const LINK_AT = /\[([^\]]+)\]\((\S+?)\)/y;
const BARE_URL_AT = /https?:\/\/[^\s]+/y;
// Punctuation that's likely sentence-ending rather than part of a bare URL
// (mirrors the marginalia note convention in `lib/notes`).
const URL_TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

// The closing star run for an opener of length `n`: the first run of exactly
// n stars; failing that, the LAST n stars of the final (longer) run, so a
// merged closer like the "***" in "**bold *it***" closes both markers — the
// leftover leading stars stay in the content as the inner closer. Returns
// where the emphasized content ends and where scanning resumes, or null when
// the opener has no closer (the opener then stays literal).
function findCloser(
  text: string,
  n: number,
  from: number,
): { end: number; resume: number } | null {
  const runs: [start: number, length: number][] = [];
  let i = from;
  while (i < text.length) {
    if (text[i] === "*") {
      let j = i;
      while (text[j] === "*") j++;
      runs.push([i, j - i]);
      i = j;
    } else {
      i++;
    }
  }
  const exact = runs.find(([, length]) => length === n);
  if (exact) return { end: exact[0], resume: exact[0] + n };
  const last = runs[runs.length - 1];
  if (last && last[1] > n) {
    const [start, length] = last;
    return { end: start + length - n, resume: start + length };
  }
  return null;
}

function parseInline(
  text: string,
  style: InlineStyle,
  out: TextSegment[],
): void {
  const push = (t: string, code = false) => {
    if (!t) return;
    out.push({
      text: t,
      bold: style.bold,
      italic: style.italic,
      strike: style.strike,
      code,
      ...(style.href && { href: style.href }),
    });
  };

  let cursor = 0;
  let plain = 0; // start of the pending unstyled run
  while (cursor < text.length) {
    const ch = text[cursor];

    // `code` — verbatim content, no nesting inside.
    if (ch === "`") {
      const close = text.indexOf("`", cursor + 1);
      if (close > cursor + 1) {
        push(text.slice(plain, cursor));
        push(text.slice(cursor + 1, close), true);
        cursor = plain = close + 1;
        continue;
      }
    }

    // * / ** / *** emphasis — matching closer required, nesting allowed.
    if (ch === "*") {
      let run = 1;
      while (text[cursor + run] === "*") run++;
      const n = Math.min(run, 3);
      const closer = findCloser(text, n, cursor + run);
      if (closer && closer.end > cursor + run) {
        push(text.slice(plain, cursor));
        parseInline(
          text.slice(cursor + n, closer.end),
          {
            ...style,
            bold: style.bold || n >= 2,
            italic: style.italic || n % 2 === 1,
          },
          out,
        );
        cursor = plain = closer.resume;
        continue;
      }
      cursor += run; // unmatched run stays literal
      continue;
    }

    // ~~strike~~
    if (ch === "~" && text[cursor + 1] === "~") {
      const close = text.indexOf("~~", cursor + 2);
      if (close > cursor + 2) {
        push(text.slice(plain, cursor));
        parseInline(text.slice(cursor + 2, close), { ...style, strike: true }, out);
        cursor = plain = close + 2;
        continue;
      }
      cursor += 2;
      continue;
    }

    // [label](url) — the label is parsed for nested styling.
    if (ch === "[") {
      LINK_AT.lastIndex = cursor;
      const match = LINK_AT.exec(text);
      if (match) {
        push(text.slice(plain, cursor));
        parseInline(match[1], { ...style, href: match[2] }, out);
        cursor = plain = cursor + match[0].length;
        continue;
      }
    }

    // Bare URL at a word boundary — displayed without the protocol noise.
    if (
      ch === "h" &&
      (cursor === 0 || /[\s(]/.test(text[cursor - 1])) &&
      (text.startsWith("http://", cursor) || text.startsWith("https://", cursor))
    ) {
      BARE_URL_AT.lastIndex = cursor;
      const match = BARE_URL_AT.exec(text)!;
      const href = match[0].replace(URL_TRAILING_PUNCTUATION, "");
      push(text.slice(plain, cursor));
      out.push({
        text: href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
        bold: style.bold,
        italic: style.italic,
        strike: style.strike,
        code: false,
        href,
      });
      cursor = plain = cursor + href.length;
      continue;
    }

    cursor++;
  }
  push(text.slice(plain));
}

export function textSegments(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  parseInline(text, { bold: false, italic: false, strike: false }, out);
  return out;
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
