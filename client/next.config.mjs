import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname, '../'),
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/Department',
        destination: '/api/department',
      },
      {
        source: '/api/Department/:path*',
        destination: '/api/department/:path*',
      },
      {
        source: '/api/students',
        destination: '/api/student',
      },
      {
        source: '/api/students/:path*',
        destination: '/api/student/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://stoofi-backend.vercel.app/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
