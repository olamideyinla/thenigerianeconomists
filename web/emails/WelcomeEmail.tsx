import { Button, Section, Text, Row, Column } from '@react-email/components'
import { EmailShell, ContentDivider, C, F } from './components/EmailShell'

const BASE_URL = 'https://thenigerianeconomists.com'

interface Props {
  email: string
  unsubscribeUrl: string
  name?: string
}

export function WelcomeEmail({ email: _email, unsubscribeUrl, name }: Props) {
  const greeting = name ? `Welcome, ${name}` : 'Welcome aboard'

  return (
    <EmailShell
      previewText="You're confirmed — welcome to The Nigerian Economists"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, marginBottom: 16 }}>
        Subscription confirmed
      </Text>

      <Text style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px 0', lineHeight: '1.25' }}>
        {greeting}
      </Text>

      <Text style={{ fontFamily: F.sans, fontSize: 15, color: C.textSecondary, lineHeight: '1.7', margin: '0 0 24px 0' }}>
        Your subscription to <strong style={{ color: C.textPrimary }}>The Nigerian Economists</strong> is confirmed.
        You&apos;ll receive our weekly synthesis of economic developments in Nigeria, written by
        independent economists — free of charge, free of advertising.
      </Text>

      <ContentDivider />

      <Text style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px 0' }}>
        What to expect each week
      </Text>

      <Row style={{ marginBottom: 12 }}>
        <Column style={{ width: 20, verticalAlign: 'top', paddingTop: 2 }}>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.accent, fontWeight: 700, margin: 0 }}>→</Text>
        </Column>
        <Column>
          <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: 0 }}>
            <strong style={{ color: C.textPrimary }}>The Weekly Synthesis</strong> — a curated editorial
            overview of economic developments, data releases, and policy shifts.
          </Text>
        </Column>
      </Row>

      <Row style={{ marginBottom: 12 }}>
        <Column style={{ width: 20, verticalAlign: 'top', paddingTop: 2 }}>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.accent, fontWeight: 700, margin: 0 }}>→</Text>
        </Column>
        <Column>
          <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: 0 }}>
            <strong style={{ color: C.textPrimary }}>Featured analyses</strong> — in-depth pieces on
            monetary policy, fiscal policy, banking, trade, and welfare.
          </Text>
        </Column>
      </Row>

      <Row style={{ marginBottom: 28 }}>
        <Column style={{ width: 20, verticalAlign: 'top', paddingTop: 2 }}>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.accent, fontWeight: 700, margin: 0 }}>→</Text>
        </Column>
        <Column>
          <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: 0 }}>
            <strong style={{ color: C.textPrimary }}>Rebuttals and corrections</strong> — when the evidence
            demands it, we publish corrections promptly and without equivocation.
          </Text>
        </Column>
      </Row>

      <Section style={{ textAlign: 'center', margin: '0 0 8px 0' }}>
        <Button
          href={BASE_URL}
          style={{
            backgroundColor: C.navy,
            color: C.textWhite,
            fontFamily: F.sans,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.05em',
            padding: '13px 32px',
            borderRadius: 2,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Start reading →
        </Button>
      </Section>
    </EmailShell>
  )
}
