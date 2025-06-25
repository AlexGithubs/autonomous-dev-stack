/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    
    // Security headers
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()'
            }
          ]
        }
      ];
    },
  
    // Redirects
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
      ];
    },
  
    // Environment variables
    env: {
      NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
      NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    },
  
    // Image optimization
    images: {
      domains: ['localhost'],
      formats: ['image/avif', 'image/webp'],
    },
  
    // Webpack config
    webpack: (config, { isServer }) => {
      // Add custom webpack configurations here
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      
      return config;
    },
  
    // Experimental features
    experimental: {
      optimizeCss: true,
      scrollRestoration: true,
    },
  
    // Output configuration
    output: 'standalone',
    
    // Disable powered by header
    poweredByHeader: false,
    
    // Compress responses
    compress: true,
    
    // Generate build ID
    generateBuildId: async () => {
      return process.env.GIT_COMMIT_SHA || `build-${Date.now()}`;
    },
  };
  
  module.exports = nextConfig;