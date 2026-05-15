import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET — one-click unsubscribe from rebuttal alert emails
// Used by the link in notification emails. No auth required (low-risk action).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return new NextResponse('Missing email parameter', { status: 400 })
  }

  const article = await db.article.findUnique({
    where: { slug },
    select: { id: true, headline: true },
  })

  if (!article) {
    return new NextResponse('Article not found', { status: 404 })
  }

  await db.rebuttalAlert.deleteMany({
    where: { articleId: article.id, email },
  })

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thenigerianeconomists.com'

  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Unsubscribed</title>
    <style>body{font-family:Georgia,serif;max-width:520px;margin:4rem auto;padding:0 1.5rem;color:#1a1a1a}
    h1{font-size:1.5rem;font-weight:600;margin-bottom:1rem}p{line-height:1.7;color:#444}
    a{color:#b45309}</style></head><body>
    <h1>You have unsubscribed.</h1>
    <p>You will no longer receive rebuttal alerts for<br/><strong>${article.headline}</strong>.</p>
    <p><a href="${SITE}/articles/${slug}">Return to article &rarr;</a></p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } },
  )
}
