import { createHmac, timingSafeEqual } from 'crypto'

const secret = () => {
  const s = process.env.UNSUBSCRIBE_SECRET
  if (!s) throw new Error('UNSUBSCRIBE_SECRET env var is not set')
  return s
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac('sha256', secret())
    .update(email.toLowerCase().trim())
    .digest('base64url')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email)
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(token, 'utf8'))
  } catch {
    return false
  }
}

export function buildUnsubscribeUrl(email: string): string {
  const base = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? 'https://thenigerianeconomists.com'
  const sig = generateUnsubscribeToken(email)
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&sig=${sig}`
}
