import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getResend } from '@/lib/email'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thenigerianeconomists.com'
const FROM = 'The Nigerian Economist <noreply@thenigerianeconomists.com>'

// ── POST — subscribe to rebuttal alerts ───────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
    select: {
      id: true,
      headline: true,
      rebuttedBy: {
        include: {
          rebuttalArticle: {
            select: { headline: true, slug: true, author: { select: { name: true } }, publishedAt: true },
          },
        },
      },
    },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const email = session.user.email
  const userId = session.user.id ?? null

  // Upsert — safe to call repeatedly
  await db.rebuttalAlert.upsert({
    where: { articleId_email: { articleId: article.id, email } },
    create: { articleId: article.id, email, userId },
    update: {},
  })

  // If rebuttals already exist, send them immediately
  if (article.rebuttedBy.length > 0) {
    const resend = getResend()
    const unsubUrl = `${SITE}/api/articles/${slug}/rebuttal-alert/unsubscribe?email=${encodeURIComponent(email)}`

    const listHtml = article.rebuttedBy
      .map((rb) => {
        const a = rb.rebuttalArticle
        return `<li style="margin-bottom:0.5rem">
          <a href="${SITE}/articles/${a.slug}" style="color:#b45309;font-weight:600">${a.headline}</a><br/>
          <span style="font-size:0.85rem;color:#555">${a.author.name}${a.publishedAt ? ' · ' + new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
        </li>`
      })
      .join('')

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Responses to "${article.headline}" — The Nigerian Economists`,
      html: `
        <p>You subscribed to rebuttal alerts for:</p>
        <p style="font-weight:600;font-size:1.05rem">"${article.headline}"</p>
        <p>The following response${article.rebuttedBy.length > 1 ? 's have' : ' has'} already been published:</p>
        <ul style="padding-left:1.25rem;line-height:1.75">${listHtml}</ul>
        <p>We will also email you whenever a new response is published.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0"/>
        <p style="font-size:0.8rem;color:#888">
          <a href="${unsubUrl}" style="color:#888">Unsubscribe from rebuttal alerts for this article</a>
        </p>
      `,
    }).catch((e: unknown) => console.error('[rebuttal-alert] immediate email failed', e))
  }

  return NextResponse.json({ ok: true, subscribed: true })
}

// ── DELETE — unsubscribe ───────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  await db.rebuttalAlert.deleteMany({
    where: { articleId: article.id, email: session.user.email },
  })

  return NextResponse.json({ ok: true, subscribed: false })
}
