"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { normalizeAnchor } from "@/lib/notes";
import { COMMENT_BODY_MAX, COMMENT_NAME_MAX } from "@/lib/comments";
import { selectionContext } from "@/components/annotation-capture";
import { editorButton, editorField } from "@/components/form-classes";
import { addComment } from "@/app/actions";

/* ---------------------------------------------------------------------------
   CommentCapture — wraps a post's rendered body so ANYONE (not just the
   owner) can pin a comment or an emoji reaction to selected text, in the
   spirit of Google Docs. Selecting a phrase floats a small toolbar (a
   "comment" bubble + an "add reaction" face) just under the selection; picking
   either opens a card in the right margin at the selection's height, and the
   passage stays highlighted (a custom highlight styled like the native
   selection — see globals.css — so it survives the native selection being
   cleared when focus moves into the form). The card carries the commenter's
   name (remembered in localStorage) plus a comment box or a row of quick
   emoji, and submits through the public `addComment` action. Anchor/prefix/
   suffix are captured exactly like the owner's highlight annotations (see
   AnnotationCapture), so saved comments underline the phrase and surface in
   the margin panel. When the right margin is too thin (mobile) the card falls
   back to anchoring under the selection.
   ------------------------------------------------------------------------- */

const NAME_KEY = "comment-name";

// Quick reactions, mirroring Google Docs' emoji strip.
const REACTIONS = ["👍", "❤️", "😂", "🎉", "🤔", "👀"];

// The right margin card, Docs-style: a gap after the text column, a preferred
// width, and the narrowest strip of right margin that still fits it (below
// that — mobile — the card falls back to anchoring at the selection).
const MARGIN_GAP = 24;
const MARGIN_EDGE = 16;
const MARGIN_MIN_WIDTH = 176;
const MARGIN_MAX_WIDTH = 300;

// What kind of card is open (null = toolbar only, no card yet).
type Mode = "comment" | "reaction";

// The registered custom-highlight name; styled in globals.css to match the
// native selection so a commented passage stays highlighted while the form is
// focused (the native selection would otherwise dim/clear).
const HIGHLIGHT_NAME = "comment-selection";
const supportsHighlight =
  typeof CSS !== "undefined" && "highlights" in CSS && "Highlight" in globalThis;

// Where a comment would pin, captured while the selection is still live
// (clicking the toolbar collapses it). All coordinates are wrapper-relative
// and captured up front so render never touches the DOM.
type Target = {
  anchor: string;
  prefix: string;
  suffix: string;
  // The selection: horizontal center, top edge, and bottom edge.
  x: number;
  y: number;
  bottom: number;
  // The wrapper's width, for clamping the selection-anchored fallback.
  width: number;
  // Right-margin placement (left edge + card width), when the margin has
  // room; null anchors to the selection instead (narrow viewports).
  margin: { x: number; width: number } | null;
};

export function CommentCapture({
  postId,
  children,
}: {
  postId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  // The live selection range, captured on settle so opening a card can pin the
  // persistent highlight to it before the native selection is cleared.
  const rangeRef = useRef<Range | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Mirrors whether a card is open for the deferred settle callback below. The
  // click that OPENS a card also fires a pointerup, whose queued settle would
  // see the now-collapsed selection and clear the target — unmounting the card
  // right after it appears. React detaches the listeners on open, but that
  // cleanup can land after the already-queued timeout, so settle double-checks
  // this ref, which the open/close handlers flip synchronously.
  const openRef = useRef(false);

  // Selections settle after pointerup (mouse/touch) or keyup (shift+arrows).
  // A valid selection inside the wrapper floats the toolbar; anything else
  // clears it. While a card is open the listeners are detached entirely,
  // freezing the captured target.
  useEffect(() => {
    if (mode) return;
    const settle = () => {
      if (openRef.current) return;
      const wrapper = wrapperRef.current;
      const selection = window.getSelection();
      if (!wrapper || !selection || selection.isCollapsed) {
        setTarget(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (
        !wrapper.contains(range.startContainer) ||
        !wrapper.contains(range.endContainer)
      ) {
        setTarget(null);
        return;
      }
      const raw = selection.toString();
      const anchor = normalizeAnchor(raw);
      if (!anchor) {
        setTarget(null);
        return;
      }
      const { prefix, suffix } = selectionContext(range, raw);
      const rect = range.getBoundingClientRect();
      const box = wrapper.getBoundingClientRect();

      // The right margin, Docs-style: the space to the right of the text
      // column (the shell reserves it via pr-margin-pane on lg+). Pin the card
      // one gap past the column's right edge, as wide as fits before the
      // viewport edge. When the margin is too thin (mobile) fall back to
      // anchoring at the selection.
      const viewport = document.documentElement.clientWidth;
      const available = viewport - box.right - MARGIN_GAP - MARGIN_EDGE;
      const margin: Target["margin"] =
        available >= MARGIN_MIN_WIDTH
          ? {
              x: box.width + MARGIN_GAP,
              width: Math.min(available, MARGIN_MAX_WIDTH),
            }
          : null;

      rangeRef.current = range.cloneRange();
      setTarget({
        anchor,
        prefix,
        suffix,
        x: rect.left + rect.width / 2 - box.left,
        y: rect.top - box.top,
        bottom: rect.bottom - box.top,
        width: box.width,
        margin,
      });
    };
    // Selection is only final after the event finishes dispatching.
    let timer: ReturnType<typeof setTimeout>;
    const onSettle = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 0);
    };
    document.addEventListener("pointerup", onSettle);
    document.addEventListener("keyup", onSettle);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerup", onSettle);
      document.removeEventListener("keyup", onSettle);
    };
  }, [mode]);

  // Open a card (comment box or reaction strip). The remembered name loads
  // here (not in an effect) so inputs still server-render empty without a
  // hydration mismatch. The captured range is pinned as a custom highlight
  // (styled to match the native selection) so the passage stays highlighted
  // once the native selection is cleared and focus moves into the form.
  const openCard = (next: Mode) => {
    setName((prev) => prev || localStorage.getItem(NAME_KEY) || "");
    setError(null);
    openRef.current = true;
    setMode(next);
    const range = rangeRef.current;
    if (supportsHighlight && range) {
      CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
    }
    window.getSelection()?.removeAllRanges();
  };

  const close = () => {
    openRef.current = false;
    setMode(null);
    setTarget(null);
    setError(null);
    setBody("");
    if (supportsHighlight) CSS.highlights.delete(HIGHLIGHT_NAME);
  };

  // Drop the highlight if the component unmounts (e.g. client-side nav) with a
  // card still open.
  useEffect(
    () => () => {
      if (supportsHighlight) CSS.highlights.delete(HIGHLIGHT_NAME);
    },
    [],
  );

  // Escape and clicks outside the card dismiss it.
  useEffect(() => {
    if (!mode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [mode]);

  // Shared submit path for both a written comment and an emoji reaction; the
  // reaction is stored as a comment whose body is the emoji.
  const send = (text: string) => {
    if (!target) return;
    if (!name.trim()) {
      setError("Add your name first.");
      nameRef.current?.focus();
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addComment({
        postId,
        anchor: target.anchor,
        prefix: target.prefix,
        suffix: target.suffix,
        name,
        body: text,
        website,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      localStorage.setItem(NAME_KEY, name.trim());
      close();
      router.refresh();
    });
  };

  // For the selection-anchored fallback (no right gutter): keep the popover
  // inside the text column — it's translate(-50%) centered on the selection,
  // so clamp the center point instead of the edges.
  const clampX = (x: number, halfWidth: number) => {
    const width = target?.width ?? 0;
    return Math.min(
      Math.max(x, halfWidth),
      Math.max(halfWidth, width - halfWidth),
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* The custom-highlight style, kept out of globals.css because the build
          strips unknown highlight pseudo-elements; inlined here it reaches the
          browser verbatim. Matches ::selection so a commented passage keeps the
          look of a live selection after the native one is cleared. */}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `::highlight(${HIGHLIGHT_NAME}){background-color:var(--foreground);color:var(--background);}`,
        }}
      />
      {children}

      {/* The toolbar always floats just under the selection (Docs-style),
          regardless of where the card will open. */}
      {target && !mode && (
        <div
          // pointerdown would collapse the selection before click fires;
          // preventing default keeps it (and the captured target) intact.
          onPointerDown={(e) => e.preventDefault()}
          className="absolute z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-border bg-background-200 p-1 shadow-lg"
          style={{ left: clampX(target.x, 40), top: target.bottom + 8 }}
        >
          <button
            type="button"
            aria-label="Comment"
            title="Comment"
            onClick={() => openCard("comment")}
            className="link-glow flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-alpha-200"
          >
            <CommentIcon />
          </button>
          <button
            type="button"
            aria-label="Add reaction"
            title="Add reaction"
            onClick={() => openCard("reaction")}
            className="link-glow flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-alpha-200"
          >
            <ReactionIcon />
          </button>
        </div>
      )}

      {target && mode && (
        <div
          ref={cardRef}
          className={`absolute z-30 space-y-3 ${
            target.margin ? "" : "w-72 max-w-full -translate-x-1/2"
          }`}
          style={
            target.margin
              ? {
                  left: target.margin.x,
                  top: target.y,
                  width: target.margin.width,
                }
              : { left: clampX(target.x, 144), top: target.bottom + 8 }
          }
        >
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            maxLength={COMMENT_NAME_MAX}
            disabled={pending}
            className={editorField}
          />

          {mode === "comment" ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="say something"
              rows={3}
              autoFocus
              maxLength={COMMENT_BODY_MAX}
              disabled={pending}
              className={`${editorField} resize-y`}
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => send(emoji)}
                  disabled={pending}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gray-alpha-200 disabled:opacity-60"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Honeypot: invisible to people, tempting to bots. */}
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />

          {error && <p className="copy-14">{error}</p>}

          <div className="flex gap-4">
            {mode === "comment" && (
              <button
                type="button"
                onClick={() => send(body)}
                disabled={pending || !name.trim() || !body.trim()}
                className={editorButton}
              >
                {pending ? "sending…" : "send"}
              </button>
            )}
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className={editorButton}
            >
              cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M2.5 3.5h11v7h-6l-3 2.5V10.5h-2z" />
    </svg>
  );
}

function ReactionIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 9.5a3 3 0 0 0 5 0" />
      <path d="M5.75 6h.01M10.25 6h.01" />
    </svg>
  );
}
