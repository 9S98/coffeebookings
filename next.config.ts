
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
    ],
  },
  /**
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: [
    'https://6000-firebase-studio-1748457547063.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev',
  ],
};

export default nextConfig;
