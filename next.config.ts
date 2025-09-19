import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist']
  }
};

export default nextConfig;
