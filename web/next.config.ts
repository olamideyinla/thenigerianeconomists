import type { NextConfig } from 'next'

function r2Hostname(): string | undefined {
  const url = process.env.R2_PUBLIC_URL
  if (!url) return undefined
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

const hostname = r2Hostname()

// ── Content-Security-Policy ───────────────────────────────────────────────────
// One policy for all routes. unsafe-eval is required by Monaco (admin editor).
// iframe embeds: Datawrapper, Flourish, Observable.
// frame-ancestors 'self' blocks external embedding while allowing the
// admin preview iframe (same origin).

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://plausible.io",
  "frame-src 'self' https://datawrapper.de https://*.datawrapper.de https://public.flourish.studio https://flo.uri.sh https://observablehq.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: hostname
      ? [{ protocol: 'https', hostname }]
      : [],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ]
  },
}

export default nextConfig
