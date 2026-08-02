import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
