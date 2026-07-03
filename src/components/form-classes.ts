/* ---------------------------------------------------------------------------
   Shared class strings for the site's form chrome, so every editor and form
   draws from one set of styles.

   - `editor*` — the owner's inline editing tools (marginalia notes, post and
     page editors): hairline-boxed fields and lowercase mono-alias buttons.
   - `underline*` — the public single-line forms (login, newsletter): a bare
     input and a text button sitting on one shared hairline.
   ------------------------------------------------------------------------- */

export const editorButton =
  "mono-13 link-glow underline decoration-dotted underline-offset-4 disabled:opacity-60";

export const editorField =
  "copy-14 w-full border border-border bg-transparent p-2 text-foreground focus:border-foreground focus:outline-none disabled:opacity-60";

export const editorTextarea =
  "copy-18 field-sizing-content min-h-48 w-full resize-y border border-border bg-transparent p-3 focus:border-foreground focus:outline-none disabled:opacity-60";

export const underlineRow =
  "flex items-center gap-3 border-b border-border focus-within:border-foreground";

export const underlineInput =
  "copy-16 min-w-0 flex-1 bg-transparent py-2 text-foreground placeholder:text-foreground placeholder:opacity-40 focus:outline-none disabled:opacity-60";

export const underlineSubmit =
  "copy-16 link-glow shrink-0 py-2 text-foreground disabled:opacity-60";
