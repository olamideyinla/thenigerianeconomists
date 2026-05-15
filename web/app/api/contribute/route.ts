import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getResend } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const body = await req.json() as {
    headline?: string
    deck?: string
    body?: string
    affiliation?: string
    coiDisclosure?: string
  }

  const { headline, deck, body: articleBody, affiliation, coiDisclosure } = body

  if (!headline?.trim()) {
    return NextResponse.json({ error: 'A headline is required.' }, { status: 400 })
  }
  if (!deck?.trim()) {
    return NextResponse.json({ error: 'A subtitle / standfirst is required.' }, { status: 400 })
  }
  if (!articleBody?.trim()) {
    return NextResponse.json({ error: 'Article body is required.' }, { status: 400 })
  }

  // Body may be HTML from the rich editor — strip tags before counting words
  const plainText = articleBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0

  if (wordCount < 800) {
    return NextResponse.json({ error: `Your article is ${wordCount} words. Minimum is 800.` }, { status: 400 })
  }
  if (wordCount > 7000) {
    return NextResponse.json({ error: `Your article is ${wordCount.toLocaleString()} words. Maximum is 7,000.` }, { status: 400 })
  }

  try {
    const submission = await db.submission.create({
      data: {
        userId: session.user.id ?? null,
        email: session.user.email,
        name: session.user.name ?? session.user.email,
        headline: headline.trim(),
        deck: deck.trim() || null,
        body: articleBody.trim(),
        wordCount,
        affiliation: affiliation?.trim() || null,
        coiDisclosure: coiDisclosure?.trim() || null,
      },
    })

    const resend = getResend()
    const editorialEmail = process.env.AUTH_ADMIN_EMAIL ?? 'thenigerianeconomists@gmail.com'

    await resend.emails.send({
      from: 'The Nigerian Economists <noreply@updates.thenigerianeconomists.com>',
      to: editorialEmail,
      subject: `[Submission] ${headline.trim()}`,
      html: `
        <p><strong>From:</strong> ${session.user.name ?? ''} &lt;${session.user.email}&gt;</p>
        <p><strong>Headline:</strong> ${headline.trim()}</p>
        <p><strong>Subtitle:</strong> ${deck.trim()}</p>
        <p><strong>Word count:</strong> ${wordCount.toLocaleString()}</p>
        ${affiliation ? `<p><strong>Affiliation:</strong> ${affiliation}</p>` : ''}
        ${coiDisclosure ? `<p><strong>COI disclosure:</strong> ${coiDisclosure}</p>` : ''}
        <p><strong>Submission ID:</strong> ${submission.id}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0"/>
        <div style="font-family:Georgia,serif;line-height:1.75;font-size:15px">${articleBody.trim()}</div>
      `,
    }).catch((e: unknown) => console.error('[contribute] editor notification failed', e))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contribute] error:', e)
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
