import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.29.180',
    'localhost',
    '127.0.0.1',
    '192.168.29.180:3000',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  async rewrites() {
    return [
      { source: '/board', destination: '/' },
      { source: '/dashboard', destination: '/' },
      { source: '/docs', destination: '/' },
      { source: '/workspace-settings', destination: '/' },
      { source: '/rbac', destination: '/' },
      { source: '/teams', destination: '/' },
      { source: '/profile', destination: '/' },
    ];
  },
};

export default nextConfig;
