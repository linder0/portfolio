import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Keep the dev-only indicator out of the bottom-right corner, where the
  // social links now live.
  devIndicators: {
    position: "bottom-left",
  },
  experimental: {
    // Dev-only safety net: Next's HMR fetch cache (default on) caches fetch
    // responses in Server Components across router.refresh()/HMR, clearing only
    // on full reload or navigation — which can make an owner edit look like it
    // didn't save. Data now lives in Upstash Redis (strongly consistent), so
    // this mostly doesn't apply, but disabling it keeps dev reads honest.
    // Dev-only; production is unaffected.
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;
