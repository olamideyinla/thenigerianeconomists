import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=invalid', req.url))
  }

  const subscription = await db.newsletterSubscription.findUnique({
    where: { confirmToken: token },
  })

  if (!subscription) {
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=invalid', req.url))
  }

  if (subscription.confirmedAt) {
    // Already confirmed — just redirect to success
    return NextResponse.redirect(new URL('/newsletter/confirmed', req.url))
  }

  await db.newsletterSubscription.update({
    where: { id: subscription.id },
    data: {
      confirmedAt: new Date(),
      confirmToken: null,
    },
  })

  // Fire and forget — don't block the redirect on email send
  try {
    const unsubscribeUrl = buildUnsubscribeUrl(subscription.email)
    sendEmail({
      to: subscription.email,
      subject: 'Welcome to The Nigerian Economists',
      react: WelcomeEmail({ email: subscription.email, unsubscribeUrl }),
      emailType: 'welcome',
    }).catch((e) => console.error('[newsletter/confirm] welcome email failed', e))
  } catch (e) {
    console.error('[newsletter/confirm] welcome email setup failed', e)
  }

  return NextResponse.redirect(new URL('/newsletter/confirmed', req.url))
}
