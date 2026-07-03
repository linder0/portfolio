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
};

export default nextConfig;
