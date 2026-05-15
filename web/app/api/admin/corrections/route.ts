import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { CorrectionNotice } from '@/emails/CorrectionNotice'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function POST(req: NextRequest) {
  const user = await requireEditor()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const correction = await db.correction.create({
    data: {
      articleId: body.articleId,
      correctionText: body.body,
      severityLevel: body.severity,
      issuedBy: user.id ?? 'unknown',
    },
    include: { article: true },
  })

  // Notify endorsers when correction is SIGNIFICANT
  if (correction.severityLevel === 'SIGNIFICANT') {
    notifyEndorsers(correction).catch((e) =>
      console.error('[corrections] endorser notification failed', e),
    )
  }

  return Response.json({ correction })
}

async function notifyEndorsers(correction: {
  articleId: string
  correctionText: string
  severityLevel: string
  issuedAt: Date
  article: { headline: string; slug: string }
}) {
  const endorsements = await db.endorsement.findMany({
    where: { articleId: correction.articleId },
    include: { user: { select: { email: true, name: true } } },
  })

  await Promise.allSettled(
    endorsements
      .filter((e) => !!e.user.email)
      .map((e) =>
        sendEmail({
          to: e.user.email!,
          subject: `Significant correction issued — ${correction.article.headline}`,
          react: CorrectionNotice({
            recipientEmail: e.user.email!,
            recipientName: e.user.name ?? undefined,
            article: { headline: correction.article.headline, slug: correction.article.slug },
            correction: {
              correctionText: correction.correctionText,
              issuedAt: correction.issuedAt,
              severityLevel: correction.severityLevel,
            },
          }),
          emailType: 'correction_notice',
        }),
      ),
  )
}
