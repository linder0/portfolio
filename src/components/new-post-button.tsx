"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMargin } from "@/components/marginalia";
import { editorButton } from "@/components/form-classes";
import { createPost } from "@/app/actions";

// Owner-only: creates a blank post and jumps to it. `base` is the section's
// link prefix ("" on the writing subdomain, "/writing" elsewhere).
export function NewPostButton({ base }: { base: string }) {
  const { canEdit } = useMargin();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!canEdit) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await createPost();
          if ("slug" in result) {
            router.push(`${base}/${result.slug}`);
            router.refresh();
          }
        })
      }
      className={editorButton}
    >
      {pending ? "creating…" : "+ new post"}
    </button>
  );
}
