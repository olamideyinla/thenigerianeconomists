import { Button, Section, Text, Link } from '@react-email/components'
import { EmailShell, ContentDivider, C, F } from './components/EmailShell'
import { format } from 'date-fns'

const BASE_URL = 'https://thenigerianeconomists.com'

interface Props {
  recipientEmail: string
  recipientName?: string
  article: {
    headline: string
    slug: string
  }
  correction: {
    correctionText: string
    issuedAt: Date | string
    severityLevel: string
  }
}

const SEVERITY_LABEL: Record<string, string> = {
  TYPO: 'Typographical correction',
  CLARIFICATION: 'Clarification',
  FACTUAL: 'Factual correction',
  SIGNIFICANT: 'Significant correction',
}

export function CorrectionNotice({ recipientEmail, recipientName, article, correction }: Props) {
  const articleUrl = `${BASE_URL}/articles/${article.slug}`
  const issuedDate = typeof correction.issuedAt === 'string'
    ? new Date(correction.issuedAt)
    : correction.issuedAt
  const severityLabel = SEVERITY_LABEL[correction.severityLevel] ?? correction.severityLevel
  const greeting = recipientName ? `Dear ${recipientName},` : 'Dear reader,'

  return (
    <EmailShell
      previewText={`Significant correction issued — ${article.headline} | The Nigerian Economists`}
    >
      <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c0392b', margin: '0 0 16px 0' }}>
        {severityLabel}
      </Text>

      <Text style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: C.textPrimary, lineHeight: '1.3', margin: '0 0 20px 0' }}>
        A correction has been issued to an article you endorsed
      </Text>

      <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 4px 0' }}>
        {greeting}
      </Text>

      <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 24px 0' }}>
        You previously endorsed the following article. A{' '}
        <strong style={{ color: C.textPrimary }}>{severityLabel.toLowerCase()}</strong>{' '}
        has been issued as of{' '}
        <strong style={{ color: C.textPrimary }}>{format(issuedDate, 'd MMMM yyyy')}</strong>.
      </Text>

      {/* Article reference */}
      <Section style={{
        borderLeft: `3px solid ${C.accent}`,
        paddingLeft: 16,
        marginBottom: 24,
      }}>
        <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
          Article
        </Text>
        <Link href={articleUrl} style={{ textDecoration: 'none' }}>
          <Text style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: C.navy, lineHeight: '1.35', margin: 0 }}>
            {article.headline}
          </Text>
        </Link>
      </Section>

      {/* Correction text */}
      <Section style={{
        backgroundColor: '#fff8f8',
        border: '1px solid #fcc',
        borderRadius: 3,
        padding: '16px 20px',
        marginBottom: 28,
      }}>
        <Text style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c0392b', margin: '0 0 8px 0' }}>
          Correction notice
        </Text>
        <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textPrimary, lineHeight: '1.6', margin: 0 }}>
          {correction.correctionText}
        </Text>
      </Section>

      <Section style={{ marginBottom: 28 }}>
        <Button
          href={articleUrl}
          style={{
            backgroundColor: C.navy,
            color: C.textWhite,
            fontFamily: F.sans,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.05em',
            padding: '12px 28px',
            borderRadius: 2,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          View corrected article →
        </Button>
      </Section>

      <ContentDivider />

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, lineHeight: '1.6', margin: 0 }}>
        You are receiving this notification because you endorsed this article on The Nigerian Economists.
        We notify endorsers of all significant corrections as part of our commitment to transparency.
        You can manage your notification preferences in your{' '}
        <Link href={`${BASE_URL}/account`} style={{ color: C.navy }}>account settings</Link>.
      </Text>
    </EmailShell>
  )
}
