import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getResend } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const body = await req.json() as {
    headline?: string
    abstract?: string
    wordCount?: string
    affiliation?: string
    coiDisclosure?: string
  }

  const { headline, abstract, wordCount } = body
  if (!headline?.trim() || !abstract?.trim() || !wordCount) {
    return NextResponse.json({ error: 'headline, abstract and wordCount are required' }, { status: 400 })
  }

  const resend = getResend()
  const editorialEmail = process.env.AUTH_ADMIN_EMAIL ?? 'thenigerianeconomists@gmail.com'

  await resend.emails.send({
    from: 'The Nigerian Economist <noreply@updates.thenigerianeconomists.com>',
    to: editorialEmail,
    subject: `[Pitch] ${headline.trim()}`,
    html: `
      <p><strong>From:</strong> ${session.user.name ?? ''} &lt;${session.user.email}&gt;</p>
      <p><strong>Headline:</strong> ${headline.trim()}</p>
      <p><strong>Word count:</strong> ${wordCount}</p>
      ${body.affiliation ? `<p><strong>Affiliation:</strong> ${body.affiliation}</p>` : ''}
      ${body.coiDisclosure ? `<p><strong>COI disclosure:</strong> ${body.coiDisclosure}</p>` : ''}
      <hr />
      <p><strong>Abstract:</strong></p>
      <p style="white-space:pre-wrap">${abstract.trim()}</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
