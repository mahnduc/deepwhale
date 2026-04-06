import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export', 
  basePath: '/deepwhale', //tên repo; đường dẫn mặc định /deepwhale
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
