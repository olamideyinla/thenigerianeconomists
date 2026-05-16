import { Button, Section, Text, Link } from '@react-email/components'
import { EmailShell, ContentDivider, C, F } from './components/EmailShell'

const BASE_URL = 'https://thenigerianeconomists.com'

interface Props {
  authorName: string
  salutation?: string | null
  article: {
    headline: string
    deck: string
    slug: string
    kicker?: string | null
    readMinutes?: number | null
  }
  topic: { name: string }
}

export function ArticlePublishedEmail({ authorName, salutation, article, topic }: Props) {
  const articleUrl = `${BASE_URL}/articles/${article.slug}`
  const displayName = salutation ? `${salutation} ${authorName}` : authorName

  return (
    <EmailShell
      previewText={`Your article "${article.headline}" is now live on The Nigerian Economists`}
    >
      <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, margin: '0 0 16px 0' }}>
        Published
      </Text>

      <Text style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: '1.3', margin: '0 0 20px 0' }}>
        Your article is now live
      </Text>

      <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 24px 0' }}>
        Dear {displayName},
      </Text>

      <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.6', margin: '0 0 24px 0' }}>
        We are pleased to inform you that your article has been published on{' '}
        <Link href={BASE_URL} style={{ color: C.navy }}>The Nigerian Economists</Link>.
        It is now publicly accessible and indexed for readers across our platform.
      </Text>

      {/* Article card */}
      <Section style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: 16, marginBottom: 28 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>
          {article.kicker ?? topic.name}
        </Text>
        <Link href={articleUrl} style={{ textDecoration: 'none' }}>
          <Text style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: C.navy, lineHeight: '1.35', margin: '0 0 6px 0' }}>
            {article.headline}
          </Text>
        </Link>
        <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.5', margin: '0 0 6px 0' }}>
          {article.deck}
        </Text>
        {article.readMinutes ? (
          <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, margin: 0 }}>
            {article.readMinutes} min read · {topic.name}
          </Text>
        ) : (
          <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, margin: 0 }}>
            {topic.name}
          </Text>
        )}
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
          Read your article →
        </Button>
      </Section>

      <ContentDivider />

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, lineHeight: '1.6', margin: 0 }}>
        You are receiving this message because your article was published on The Nigerian Economists.
        For editorial enquiries, reply to this email or contact us at{' '}
        <Link href="mailto:editor@thenigerianeconomists.com" style={{ color: C.navy }}>
          editor@thenigerianeconomists.com
        </Link>.
      </Text>
    </EmailShell>
  )
}
