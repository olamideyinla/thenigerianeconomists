import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { NewsletterConfirmEmail } from '@/emails/NewsletterConfirmEmail'

const schema = z.object({
  email: z.string().email(),
  source: z.enum(['HOMEPAGE', 'ARTICLE_FOOT', 'FOOTER', 'ADMIN']).optional(),
})

const BASE_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? 'https://thenigerianeconomists.com'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 })
  }

  const { email, source = 'HOMEPAGE' } = parsed.data

  // If already confirmed, silently succeed (don't re-send confirmation)
  const existing = await db.newsletterSubscription.findUnique({ where: { email } })
  if (existing?.confirmedAt) {
    return NextResponse.json({ ok: true })
  }

  // Check suppression list — don't re-subscribe a suppressed address
  const suppressed = await db.suppressionList.findUnique({ where: { email } })
  if (suppressed) {
    // Return ok so we don't leak suppression status to the caller
    return NextResponse.json({ ok: true })
  }

  const confirmToken = randomUUID()
  const confirmUrl = `${BASE_URL}/api/newsletter/confirm?token=${confirmToken}`

  await db.newsletterSubscription.upsert({
    where: { email },
    create: { email, source, confirmToken },
    update: { confirmToken, unsubscribedAt: null }, // allow re-subscribe after unsubscribe
  })

  await sendEmail({
    to: email,
    subject: 'Confirm your subscription to The Nigerian Economist',
    react: NewsletterConfirmEmail({ confirmUrl, email }),
    emailType: 'newsletter_confirm',
  }).catch((e) => console.error('[newsletter/subscribe] confirm email failed', e))

  return NextResponse.json({ ok: true })
}
