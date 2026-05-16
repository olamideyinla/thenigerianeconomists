import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { db } from '@/lib/db'

const FROM = 'The Nigerian Economists <noreply@updates.thenigerianeconomists.com>'

export type EmailType =
  | 'magic_link'
  | 'newsletter_confirm'
  | 'welcome'
  | 'newsletter_weekly'
  | 'newsletter_monthly'
  | 'correction_notice'
  | 'article_published'

// Lazy Resend instance — never constructed at module load time (avoids build errors)
let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY
    if (!key) throw new Error('RESEND_API_KEY or AUTH_RESEND_KEY env var is not set')
    _resend = new Resend(key)
  }
  return _resend
}

interface SendOptions {
  to: string
  subject: string
  react: ReactElement
  emailType: EmailType
  synthesisId?: string
}

// Single transactional send — logs to SentEmail
export async function sendEmail({ to, subject, react, emailType, synthesisId }: SendOptions) {
  const html = await render(react)

  const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html })

  if (error) {
    console.error('[email] send failed', { to, emailType, error })
    throw new Error(`Email send failed: ${error.message}`)
  }

  await db.sentEmail.create({
    data: { to, subject, emailType, resendId: data?.id ?? null, synthesisId: synthesisId ?? null },
  }).catch((e) => console.error('[email] sentEmail log failed', e))

  return data
}

// Batch newsletter send — filters suppressed, chunks to 100, logs all
export async function sendNewsletter(opts: {
  recipients: string[]
  subject: string
  buildEmail: (email: string) => ReactElement
  emailType: Extract<EmailType, 'newsletter_weekly' | 'newsletter_monthly'>
  synthesisId: string
}): Promise<{ sent: number; suppressed: number }> {
  const { recipients, subject, buildEmail, emailType, synthesisId } = opts

  // Filter suppression list
  const suppressed = await db.suppressionList.findMany({
    where: { email: { in: recipients } },
    select: { email: true },
  })
  const suppressedSet = new Set(suppressed.map((s) => s.email.toLowerCase()))
  const valid = recipients.filter((e) => !suppressedSet.has(e.toLowerCase()))

  const resend = getResend()
  const CHUNK = 100
  for (let i = 0; i < valid.length; i += CHUNK) {
    const chunk = valid.slice(i, i + CHUNK)

    const messages = await Promise.all(
      chunk.map(async (email) => ({
        from: FROM,
        to: email,
        subject,
        html: await render(buildEmail(email)),
      })),
    )

    await resend.batch.send(messages)

    await db.sentEmail.createMany({
      data: chunk.map((to) => ({ to, subject, emailType, synthesisId })),
    }).catch((e) => console.error('[email] batch log failed', e))
  }

  return { sent: valid.length, suppressed: suppressed.length }
}
