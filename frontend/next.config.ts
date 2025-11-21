import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  eslint: {
    // Disable ESLint during builds (for deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: Also ignore TypeScript errors during builds if needed
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
