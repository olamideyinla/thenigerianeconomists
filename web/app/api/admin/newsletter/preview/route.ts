import { type NextRequest } from 'next/server'
import { getEditorOrNull } from '@/lib/auth-helpers'
import { sendEmail } from '@/lib/email'
import { WeeklyNewsletter } from '@/emails/WeeklyNewsletter'
import { MonthlyNewsletter } from '@/emails/MonthlyNewsletter'
import { buildSynthesisEmailData } from '@/lib/newsletter-helpers'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'

export async function POST(req: NextRequest) {
  const editor = await getEditorOrNull()
  if (!editor) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { synthesisId, type } = (await req.json()) as {
    synthesisId: string
    type: 'weekly' | 'monthly'
  }

  if (!synthesisId || (type !== 'weekly' && type !== 'monthly')) {
    return Response.json({ error: 'synthesisId and type are required' }, { status: 400 })
  }

  const { synthesis, articles, topicSummaries, monthLabel, totalPublished } =
    await buildSynthesisEmailData(synthesisId)

  const to = editor.email!
  const unsubscribeUrl = buildUnsubscribeUrl(to)
  const subject =
    type === 'weekly'
      ? `[PREVIEW] The Synthesis #${synthesis.issueNumber}: ${synthesis.title}`
      : `[PREVIEW] Monthly review — ${monthLabel}`

  const react =
    type === 'weekly'
      ? WeeklyNewsletter({ unsubscribeUrl, synthesis, articles })
      : MonthlyNewsletter({ unsubscribeUrl, monthLabel, synthesis, topicSummaries, totalPublished })

  await sendEmail({ to, subject, react, emailType: type === 'weekly' ? 'newsletter_weekly' : 'newsletter_monthly', synthesisId })

  return Response.json({ ok: true, sentTo: to })
}
