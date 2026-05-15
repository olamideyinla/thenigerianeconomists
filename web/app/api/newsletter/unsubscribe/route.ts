import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const sig   = req.nextUrl.searchParams.get('sig')

  if (!email || !sig) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?status=invalid', req.url))
  }

  const valid = verifyUnsubscribeToken(email, sig)
  if (!valid) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?status=invalid', req.url))
  }

  const subscription = await db.newsletterSubscription.findUnique({ where: { email } })

  if (!subscription) {
    // Treat unknown email as already unsubscribed (don't leak info)
    return NextResponse.redirect(new URL('/newsletter/unsubscribed', req.url))
  }

  if (!subscription.unsubscribedAt) {
    await db.newsletterSubscription.update({
      where: { email },
      data: { unsubscribedAt: new Date() },
    })
  }

  return NextResponse.redirect(new URL('/newsletter/unsubscribed', req.url))
}
