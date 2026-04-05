import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  basePath: "/guarana-portal",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
