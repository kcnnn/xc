import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  webpack: (config, { isServer }) => {
    // Exclude test files from being processed by webpack
    config.module.rules.push({
      test: /\.(js|ts)$/,
      include: /node_modules\/pdf-parse\/test/,
      use: 'null-loader'
    });
    
    // Exclude PDF test files
    config.module.rules.push({
      test: /\.pdf$/,
      include: /node_modules\/pdf-parse\/test\/data/,
      use: 'null-loader'
    });
    
    return config;
  }
};

export default nextConfig;
