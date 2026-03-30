import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export', 
  basePath: '/deepwhale', //tên repo // QUAN TRỌNG: cấu hình basePath sẽ làm thay đổi đường dẫn cấu hình dự án 
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
