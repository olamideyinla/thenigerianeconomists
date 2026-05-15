// Edge-compatible auth config — no Prisma, no Node.js-only imports.
// Used exclusively by middleware.ts. The full config (with PrismaAdapter,
// providers, and session callbacks) lives in lib/auth.ts.
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  providers: [], // providers are added in lib/auth.ts only
  callbacks: {
    authorized({ auth }) {
      // Presence of auth.user means a valid session cookie exists.
      // Role enforcement is handled server-side in app/admin/layout.tsx.
      return !!auth?.user
    },
  },
} satisfies NextAuthConfig
