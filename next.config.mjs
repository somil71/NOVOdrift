/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Aggressively cache optimised images for 7 days
    minimumCacheTTL: 604800,
  },

  async headers() {
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : null

    const preconnectLinks = [
      '<https://fonts.googleapis.com>; rel=preconnect',
      '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
      ...(supabaseHost
        ? [`<https://${supabaseHost}>; rel=preconnect`]
        : []),
    ].join(', ')

    return [
      // Preconnect to key third-party origins on every page
      {
        source: '/:path*',
        headers: [{ key: 'Link', value: preconnectLinks }],
      },
      // Long-lived cache for Next.js static chunks (they include content hashes)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Medium cache for public static files
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
};

export default nextConfig;
