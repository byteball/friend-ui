import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["obyte"],
  },
  output: "standalone",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('bufferutil', 'utf-8-validate');
    } else {
      config.resolve.alias['bufferutil'] = false;
      config.resolve.alias['utf-8-validate'] = false;
    }
    return config;
  },
};

export default nextConfig;
