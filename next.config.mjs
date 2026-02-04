/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export for shared hosting
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize production build
  swcMinify: true,
  
  // Compression
  compress: true,
  
  // Optimize fonts
  optimizeFonts: true,
  
  // Production source maps (disabled for smaller bundle)
  productionBrowserSourceMaps: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable strict mode
  reactStrictMode: true,
}

export default nextConfig
