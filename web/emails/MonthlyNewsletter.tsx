import { Button, Section, Text, Link, Hr, Row, Column } from '@react-email/components'
import { EmailShell, ContentDivider, C, F, type ArticleCard } from './components/EmailShell'

const BASE_URL = 'https://thenigerianeconomists.com'

interface TopicSummary {
  topicName: string
  topicSlug: string
  articleCount: number
  articles: Pick<ArticleCard, 'headline' | 'slug'>[]
}

interface Props {
  unsubscribeUrl: string
  monthLabel: string        // e.g. "April 2025"
  synthesis: {
    issueNumber: number
    title: string
    excerpt: string
    slug: string
    editorName: string
  }
  topicSummaries: TopicSummary[]
  totalPublished: number
}

export function MonthlyNewsletter({ unsubscribeUrl, monthLabel, synthesis, topicSummaries, totalPublished }: Props) {
  const synthesisUrl = `${BASE_URL}/synthesis/${synthesis.slug}`

  return (
    <EmailShell
      previewText={`Monthly review — ${monthLabel} | The Nigerian Economist`}
      unsubscribeUrl={unsubscribeUrl}
      footerNote="You are receiving this because you subscribed to The Nigerian Economist newsletter."
    >
      {/* Month header */}
      <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.accent, margin: '0 0 4px 0' }}>
        Monthly Review
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.textLight, margin: '0 0 20px 0' }}>
        {monthLabel} · {totalPublished} {totalPublished === 1 ? 'piece' : 'pieces'} published
      </Text>

      {/* Synthesis */}
      <Link href={synthesisUrl} style={{ textDecoration: 'none' }}>
        <Text style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 700, color: C.textPrimary, lineHeight: '1.3', margin: '0 0 12px 0' }}>
          {synthesis.title}
        </Text>
      </Link>
      <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.textSecondary, lineHeight: '1.7', margin: '0 0 8px 0' }}>
        {synthesis.excerpt}
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, margin: '0 0 20px 0' }}>
        By {synthesis.editorName}
      </Text>

      <Section style={{ marginBottom: 32 }}>
        <Button
          href={synthesisUrl}
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
          Read the synthesis →
        </Button>
      </Section>

      <ContentDivider />

      {/* Topic recap */}
      <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textLight, margin: '0 0 20px 0' }}>
        What we covered in {monthLabel}
      </Text>

      {topicSummaries.map((topic, i) => (
        <div key={topic.topicSlug}>
          <Row style={{ marginBottom: 6 }}>
            <Column>
              <Link href={`${BASE_URL}/topics/${topic.topicSlug}`} style={{ textDecoration: 'none' }}>
                <Text style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.navy, margin: 0 }}>
                  {topic.topicName}
                </Text>
              </Link>
            </Column>
            <Column align="right">
              <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.textLight, margin: 0 }}>
                {topic.articleCount} {topic.articleCount === 1 ? 'piece' : 'pieces'}
              </Text>
            </Column>
          </Row>
          {topic.articles.slice(0, 3).map((a) => (
            <Text key={a.slug} style={{ fontFamily: F.sans, fontSize: 13, color: C.textSecondary, lineHeight: '1.5', margin: '0 0 2px 8px' }}>
              <Link href={`${BASE_URL}/articles/${a.slug}`} style={{ color: C.textPrimary, textDecoration: 'none' }}>
                {a.headline}
              </Link>
            </Text>
          ))}
          {i < topicSummaries.length - 1 && (
            <Hr style={{ borderColor: C.divider, margin: '16px 0' }} />
          )}
        </div>
      ))}

      <ContentDivider />

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, lineHeight: '1.6', margin: 0 }}>
        The Nigerian Economist is an independent publication committed to rigorous, evidence-based
        economic journalism. We do not accept advertising or sponsored content.{' '}
        <Link href={`${BASE_URL}/funders`} style={{ color: C.navy }}>View our funders</Link>.
      </Text>
    </EmailShell>
  )
}
