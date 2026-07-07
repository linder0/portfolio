"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCanEdit } from "@/components/marginalia";
import { editorButton, editorTextarea } from "@/components/form-classes";
import { updatePage } from "@/app/actions";

/* ---------------------------------------------------------------------------
   PageBody — wraps a page's server-rendered copy (`children`) with the
   owner's inline editing tools, mirroring PostBody but for standalone page
   copy (e.g. the home bio). Visitors just see the children. When signed in,
   an edit button swaps the copy for one text box (blank lines split
   paragraphs); clearing it reverts to the code-defined default. Saves go
   through the `updatePage` server action and re-render via router.refresh().
   ------------------------------------------------------------------------- */

export function PageBody({
  id,
  body,
  label = "edit",
  children,
}: {
  id: string;
  // The current (stored-or-default) copy, prefilled into the editor.
  body: string;
  label?: string;
  children: React.ReactNode;
}) {
  const canEdit = useCanEdit();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canEdit) return <>{children}</>;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updatePage(id, draft);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={pending}
          className={editorTextarea}
        />
        {error && <p className="copy-14">{error}</p>}
        <div className="flex flex-wrap gap-6">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className={editorButton}
          >
            {pending ? "saving…" : "save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            disabled={pending}
            className={editorButton}
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {children}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => {
            setDraft(body);
            setError(null);
            setEditing(true);
          }}
          className={editorButton}
        >
          {label}
        </button>
      </div>
      {error && <p className="copy-14 mt-4">{error}</p>}
    </div>
  );
}
