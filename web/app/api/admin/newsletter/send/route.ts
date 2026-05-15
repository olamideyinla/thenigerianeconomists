import { type NextRequest } from 'next/server'
import { getEditorOrNull } from '@/lib/auth-helpers'
import { sendNewsletter } from '@/lib/email'
import { WeeklyNewsletter } from '@/emails/WeeklyNewsletter'
import { MonthlyNewsletter } from '@/emails/MonthlyNewsletter'
import { buildSynthesisEmailData, getActiveSubscribers } from '@/lib/newsletter-helpers'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'

export async function POST(req: NextRequest) {
  const editor = await getEditorOrNull()
  if (!editor) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { synthesisId, type } = (await req.json()) as {
    synthesisId: string
    type: 'weekly' | 'monthly'
  }

  if (!synthesisId || (type !== 'weekly' && type !== 'monthly')) {
    return Response.json({ error: 'synthesisId and type (weekly|monthly) are required' }, { status: 400 })
  }

  const { synthesis, articles, topicSummaries, monthLabel, totalPublished } =
    await buildSynthesisEmailData(synthesisId)

  const recipients = await getActiveSubscribers()
  if (recipients.length === 0) {
    return Response.json({ sent: 0, suppressed: 0, message: 'No active subscribers' })
  }

  const emailType = type === 'weekly' ? 'newsletter_weekly' : 'newsletter_monthly'
  const subject =
    type === 'weekly'
      ? `The Synthesis #${synthesis.issueNumber}: ${synthesis.title}`
      : `Monthly review — ${monthLabel} | The Nigerian Economist`

  const { sent, suppressed } = await sendNewsletter({
    recipients,
    subject,
    buildEmail: (email) => {
      const unsubscribeUrl = buildUnsubscribeUrl(email)
      return type === 'weekly'
        ? WeeklyNewsletter({ unsubscribeUrl, synthesis, articles })
        : MonthlyNewsletter({ unsubscribeUrl, monthLabel, synthesis, topicSummaries, totalPublished })
    },
    emailType,
    synthesisId,
  })

  return Response.json({ sent, suppressed })
}
