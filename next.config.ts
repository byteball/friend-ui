import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["obyte"],
  },
  reactCompiler: true,
  output: "standalone",
  images: {
    localPatterns: [
      {
        pathname: '/*/**',
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/:id/chart',
        destination: '/:id?r=c',
      },
      {
        source: '/:id/streak',
        destination: '/:id?r=p',
      },
    ];
  }
};

export default nextConfig;
