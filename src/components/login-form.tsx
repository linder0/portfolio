"use client";

import { useActionState } from "react";
import {
  underlineInput,
  underlineRow,
  underlineSubmit,
} from "@/components/form-classes";
import { login } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action}>
      <div className={underlineRow}>
        <label htmlFor="admin-password" className="sr-only">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="password"
          disabled={pending}
          className={underlineInput}
        />
        <button
          type="submit"
          disabled={pending}
          className={underlineSubmit}
        >
          {pending ? "Signing in…" : "Sign in →"}
        </button>
      </div>
      {state?.error && (
        <p className="copy-14 mt-2" aria-live="polite">
          {state.error}
        </p>
      )}
    </form>
  );
}
