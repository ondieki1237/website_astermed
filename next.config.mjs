/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' - using standard Next.js deployment for dynamic routes

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    // Keep unoptimized for compatibility with backend image serving
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },

  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Compression
  compress: true,

  // Production source maps (disabled for smaller bundle)
  productionBrowserSourceMaps: false,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable strict mode
  reactStrictMode: true,
}

export default nextConfig
