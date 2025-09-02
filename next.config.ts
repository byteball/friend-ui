import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["obyte"],
  },
  output: "standalone"
};

export default nextConfig;
