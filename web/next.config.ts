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

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: hostname
      ? [
          {
            protocol: 'https',
            hostname,
          },
        ]
      : [],
  },
}

export default nextConfig
