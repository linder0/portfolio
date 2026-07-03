import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Marginalia photo uploads go through a server action; the 1mb default
      // is too small for photos.
      bodySizeLimit: "8mb",
    },
  },
  // Keep the dev-only indicator out of the bottom-right corner, where the
  // social links now live.
  devIndicators: {
    position: "bottom-left",
  },
};

export default nextConfig;
