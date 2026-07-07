import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import { logout } from "@/app/actions";
import { LoginForm } from "@/components/login-form";
import { PageMain } from "@/components/page-main";
import { getSubscribers } from "@/lib/subscriber-store";

export const metadata: Metadata = {
  title: "Admin — Linda Xue",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAuthenticated();
  const subscribers = authed ? await getSubscribers() : {};
  const subscriberList = Object.entries(subscribers).sort(([, a], [, b]) =>
    b.subscribedAt.localeCompare(a.subscribedAt),
  );

  return (
    <PageMain>
      <h1 className="heading-48">Admin</h1>

      {authed ? (
        <div className="mt-8 max-w-cap-md space-y-6">
          <p className="copy-16">
            Signed in. Select any text on a page and press{" "}
            <span className="mono-13">m</span> to pin a note to that phrase
            (select within a single paragraph) — or hover an annotatable
            element (a bio paragraph, the photo) and press{" "}
            <span className="mono-13">m</span> with nothing selected to write
            that element&rsquo;s note. Pasted URLs become links automatically
            (<span className="mono-13">[text](url)</span> if you want a label)
            and &ldquo;add photo&rdquo; embeds a photo. Clearing the content on
            save removes the note.
          </p>
          <div>
            <h2 className="copy-16 text-foreground">
              Subscribers ({subscriberList.length})
            </h2>
            {subscriberList.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {subscriberList.map(([email, { subscribedAt }]) => (
                  <li key={email} className="mono-13 flex justify-between gap-4">
                    <span className="truncate">{email}</span>
                    <span className="shrink-0 opacity-60">
                      {subscribedAt.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="copy-14 mt-2">No signups yet.</p>
            )}
          </div>
          <form action={logout}>
            <button type="submit" className="copy-16 link-glow text-foreground">
              Sign out →
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-8 max-w-cap-md">
          <LoginForm />
        </div>
      )}
    </PageMain>
  );
}
