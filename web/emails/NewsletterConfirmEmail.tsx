import { Button, Section, Text } from '@react-email/components'
import { EmailShell, ContentDivider, C, F } from './components/EmailShell'

interface Props {
  confirmUrl: string
  email: string
}

export function NewsletterConfirmEmail({ confirmUrl, email }: Props) {
  return (
    <EmailShell previewText="One click to confirm your subscription to The Nigerian Economist">
      <Text style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px 0', lineHeight: '1.3' }}>
        Confirm your subscription
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 15, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 8px 0' }}>
        You asked to receive The Nigerian Economist newsletter at{' '}
        <span style={{ color: C.textPrimary, fontWeight: 600 }}>{email}</span>.
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 15, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 28px 0' }}>
        Click the button below to confirm and start receiving independent economic analysis
        on Nigeria — every week, free of charge.
      </Text>

      <Section style={{ textAlign: 'center', margin: '0 0 32px 0' }}>
        <Button
          href={confirmUrl}
          style={{
            backgroundColor: C.accent,
            color: C.textWhite,
            fontFamily: F.sans,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '16px 40px',
            borderRadius: 2,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Yes, subscribe me
        </Button>
      </Section>

      <ContentDivider />

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, lineHeight: '1.6', margin: 0 }}>
        What you can expect: a weekly synthesis of economic developments in Nigeria, written by
        independent economists. No ads, no sponsored content. Unsubscribe at any time with one click.
        {'\n\n'}
        If you did not sign up for this newsletter, simply ignore this email. You will not receive any further messages.
      </Text>
    </EmailShell>
  )
}
