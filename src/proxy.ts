import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSection, parseHost } from "@/lib/domains";

// Maps section subdomains onto their app routes:
//   projects.lindaxue.com/        -> /projects
//   projects.lindaxue.com/floatplay -> /projects/floatplay
//   writing.lindaxue.com/         -> /writing
// The browser URL stays on the subdomain; only the served route is rewritten.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { subdomain } = parseHost(host);

  if (isSection(subdomain)) {
    const url = request.nextUrl.clone();
    const prefix = `/${subdomain}`;

    // Leave static files in /public (they have a file extension) untouched, so
    // e.g. projects.host/tag.png resolves to the real asset instead of
    // /projects/tag.png.
    if (/\.[^/]+$/.test(url.pathname)) {
      return NextResponse.next();
    }

    // /admin is served on every subdomain (not rewritten into the section) so
    // the owner can sign in per-host in dev, where *.localhost subdomains
    // can't share a session cookie.
    if (url.pathname === "/admin") {
      return NextResponse.next();
    }

    if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
      url.pathname =
        url.pathname === "/" ? prefix : `${prefix}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
