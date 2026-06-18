import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@my-noodles/theme'],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
