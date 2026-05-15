import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,    // 30 days
    updateAge: 24 * 60 * 60,       // refresh at most once per day
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'noreply@thenigerianeconomists.com',
      // Custom branded magic-link email — dynamically imported so heavy packages
      // (react-email, resend SDK) are never bundled into the Edge middleware.
      async sendVerificationRequest({ identifier: email, url }) {
        const [{ render }, { MagicLinkEmail }, { Resend: ResendSDK }] = await Promise.all([
          import('@react-email/render'),
          import('@/emails/MagicLinkEmail'),
          import('resend'),
        ])
        const html = await render(MagicLinkEmail({ url, email }))
        const resend = new ResendSDK(process.env.AUTH_RESEND_KEY)
        await resend.emails.send({
          from: 'The Nigerian Economist <noreply@thenigerianeconomists.com>',
          to: email,
          subject: 'Sign in to The Nigerian Economist',
          html,
        })
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        ;(session.user as typeof session.user & { role: string }).role =
          (user as typeof user & { role: string }).role ?? 'READER'
      }
      return session
    },
  },
})
