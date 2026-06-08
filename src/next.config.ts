if (typeof window === 'undefined') {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      // @ts-ignore
      delete globalThis.localStorage;
    } catch (e) {}
  }
}

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the
    // Firebase Studio preview URL.
    allowedDevOrigins: [
      'http://6000-firebase-studio-1752293338513.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev',
    ],
  } as any,
};

export default nextConfig;
