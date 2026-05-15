import { Button, Section, Text, Link, Hr } from '@react-email/components'
import { EmailShell, ArticleCardBlock, ContentDivider, C, F, type ArticleCard } from './components/EmailShell'
import { format } from 'date-fns'

const BASE_URL = 'https://thenigerianeconomists.com'

interface Props {
  unsubscribeUrl: string
  synthesis: {
    issueNumber: number
    weekOf: Date | string
    title: string
    excerpt: string  // first ~200 chars of contentMdx, stripped of MDX syntax
    slug: string
    editorName: string
  }
  articles: ArticleCard[]
}

export function WeeklyNewsletter({ unsubscribeUrl, synthesis, articles }: Props) {
  const weekOfDate = typeof synthesis.weekOf === 'string' ? new Date(synthesis.weekOf) : synthesis.weekOf
  const weekLabel = format(weekOfDate, 'd MMMM yyyy')
  const synthesisUrl = `${BASE_URL}/synthesis/${synthesis.slug}`

  return (
    <EmailShell
      previewText={`The Synthesis #${synthesis.issueNumber}: ${synthesis.title}`}
      unsubscribeUrl={unsubscribeUrl}
      footerNote="You are receiving this because you subscribed to The Nigerian Economist newsletter."
    >
      {/* Issue header */}
      <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.accent, margin: '0 0 4px 0' }}>
        The Synthesis · Issue {synthesis.issueNumber}
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.textLight, margin: '0 0 20px 0' }}>
        Week of {weekLabel}
      </Text>

      {/* Synthesis headline */}
      <Link href={synthesisUrl} style={{ textDecoration: 'none' }}>
        <Text style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, color: C.textPrimary, lineHeight: '1.25', margin: '0 0 14px 0' }}>
          {synthesis.title}
        </Text>
      </Link>

      <Text style={{ fontFamily: F.sans, fontSize: 15, color: C.textSecondary, lineHeight: '1.7', margin: '0 0 8px 0' }}>
        {synthesis.excerpt}
      </Text>

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, margin: '0 0 24px 0' }}>
        By {synthesis.editorName}
      </Text>

      <Section style={{ marginBottom: 28 }}>
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
          Read the full synthesis →
        </Button>
      </Section>

      {articles.length > 0 && (
        <>
          <ContentDivider />

          <Text style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textLight, margin: '0 0 20px 0' }}>
            In this issue
          </Text>

          {articles.map((article, i) => (
            <div key={article.slug}>
              <ArticleCardBlock article={article} baseUrl={BASE_URL} />
              {i < articles.length - 1 && (
                <Hr style={{ borderColor: C.divider, margin: '0 0 20px 0' }} />
              )}
            </div>
          ))}
        </>
      )}

      <ContentDivider />

      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, lineHeight: '1.6', margin: 0 }}>
        The Nigerian Economist is an independent publication committed to rigorous, evidence-based
        economic journalism. We do not accept advertising or sponsored content. Our funders are
        disclosed at{' '}
        <Link href={`${BASE_URL}/funders`} style={{ color: C.navy }}>thenigerianeconomists.com/funders</Link>.
      </Text>
    </EmailShell>
  )
}
