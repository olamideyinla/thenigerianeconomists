import { Button, Section, Text, Link } from '@react-email/components'
import { EmailShell, C, F } from './components/EmailShell'

interface Props {
  url: string
  email: string
}

export function MagicLinkEmail({ url, email }: Props) {
  return (
    <EmailShell previewText="Your sign-in link for The Nigerian Economist">
      <Text style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px 0', lineHeight: '1.3' }}>
        Sign in to your account
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 15, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 28px 0' }}>
        Click the button below to sign in to The Nigerian Economist as{' '}
        <span style={{ color: C.textPrimary, fontWeight: 600 }}>{email}</span>.
        This link expires in 24 hours and can only be used once.
      </Text>

      <Section style={{ textAlign: 'center', margin: '0 0 28px 0' }}>
        <Button
          href={url}
          style={{
            backgroundColor: C.navy,
            color: C.textWhite,
            fontFamily: F.sans,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.04em',
            padding: '14px 32px',
            borderRadius: 2,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Sign in to The Nigerian Economist
        </Button>
      </Section>

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, lineHeight: '1.5', margin: 0 }}>
        If you did not request this email, you can safely ignore it — your account will not be affected.
        The link will expire automatically.{'\n\n'}
        If the button above does not work, copy and paste this URL into your browser:{' '}
        <Link href={url} style={{ color: C.navy, wordBreak: 'break-all' }}>{url}</Link>
      </Text>
    </EmailShell>
  )
}
