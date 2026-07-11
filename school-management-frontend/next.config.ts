import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // next-pwa injects webpack config; Next 16 defaults to Turbopack in `next dev`
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
  fallbacks: {
    document: "/offline.html",
  },
});

export default withPWA(nextConfig);
