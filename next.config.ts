import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "v0-event-web-app-prototype.vercel.app" }],
  },
  /* config options here */
};

export default nextConfig;
