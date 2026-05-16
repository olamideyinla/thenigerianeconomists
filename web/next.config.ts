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
// Public site: no unsafe-eval (only unsafe-inline for Next.js hydration scripts)
// Admin routes: unsafe-eval added for Monaco editor
// Preview route (/admin/preview/*): inherits admin CSP; frame-ancestors 'self'
//   so it can be loaded inside the ArticleEditor iframe.
//
// iframe embeds allowed: Datawrapper, Flourish, Observable
// All other sites cannot embed our pages (frame-ancestors 'self').

const PUBLIC_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://plausible.io",
  // Allow embedded charts from common journalism platforms
  "frame-src 'self' https://datawrapper.de https://*.datawrapper.de https://public.flourish.studio https://flo.uri.sh https://observablehq.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

const ADMIN_CSP = [
  "default-src 'self'",
  // unsafe-eval required by Monaco editor (worker-based syntax highlighting)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://fonts.googleapis.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// Headers applied to every route
const COMMON_HEADERS = [
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
  },
  // HSTS — 2 years, include subdomains, preload-ready
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

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
      // ── Public site ────────────────────────────────────────────
      {
        source: '/((?!admin).*)',
        headers: [
          ...COMMON_HEADERS,
          { key: 'X-Frame-Options',       value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: PUBLIC_CSP },
        ],
      },
      // ── Admin routes (Monaco needs unsafe-eval) ───────────────
      {
        source: '/admin/:path*',
        headers: [
          ...COMMON_HEADERS,
          // X-Frame-Options omitted here — CSP frame-ancestors covers it.
          // (Sending both can cause conflicts in older browsers.)
          { key: 'Content-Security-Policy', value: ADMIN_CSP },
        ],
      },
    ]
  },
}

export default nextConfig
