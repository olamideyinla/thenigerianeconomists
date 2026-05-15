import { type NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/resend] RESEND_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const headers = {
    'svix-id':        req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  }

  let event: ResendWebhookEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(rawBody, headers) as ResendWebhookEvent
  } catch (err) {
    console.error('[webhook/resend] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { type, data } = event

  if (type === 'email.bounced' || type === 'email.complained') {
    const reason = type === 'email.bounced' ? 'bounce' : 'complaint'
    const recipients: string[] = Array.isArray(data.to) ? data.to : [data.to]

    for (const email of recipients) {
      await db.suppressionList.upsert({
        where: { email },
        create: { email, reason },
        update: { reason },
      }).catch((e) => console.error('[webhook/resend] suppression upsert failed', e))
    }

    console.log(`[webhook/resend] suppressed ${recipients.length} address(es) — reason: ${reason}`)
  }

  return NextResponse.json({ ok: true })
}

interface ResendWebhookEvent {
  type: string
  created_at: string
  data: {
    email_id: string
    from: string
    to: string | string[]
    subject: string
    created_at: string
  }
}
