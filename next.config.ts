import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repoName = 'uxie';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export', 
  basePath: isGithubActions ? `/${repoName}` : undefined,
  assetPrefix: isGithubActions ? `/${repoName}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
};

export default nextConfig;
