"use client";

import { useState } from "react";
import {
  underlineInput,
  underlineRow,
  underlineSubmit,
} from "@/components/form-classes";
import { useNote } from "@/components/marginalia";
import type { Note } from "@/lib/notes";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSignup({
  className,
  note = null,
}: {
  className?: string;
  // Hovering the subscribe button feeds this into the margin.
  note?: Note;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const noteHandlers = useNote(note);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        setStatus("success");
        setMessage(
          data?.alreadySubscribed
            ? "You're already on the list."
            : "You're on the list.",
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data?.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Couldn't connect. Try again.");
    }
  }

  if (status === "success") {
    return (
      <p className={`copy-16 text-right text-foreground ${className ?? ""}`} aria-live="polite">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className ?? "max-w-cap-md"} noValidate>
      <div className={underlineRow}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="xuelinda7@gmail.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          disabled={status === "loading"}
          className={underlineInput}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={underlineSubmit}
          {...noteHandlers}
        >
          {status === "loading" ? "Joining…" : "Subscribe →"}
        </button>
      </div>
      {status === "error" && (
        <p className="copy-14 mt-2" aria-live="polite">
          {message}
        </p>
      )}
    </form>
  );
}
