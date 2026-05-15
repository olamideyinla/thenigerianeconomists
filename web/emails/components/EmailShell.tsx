import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Hr,
} from '@react-email/components'

// Fixed brand colours — no CSS variables (Gmail dark mode mangles them)
export const C = {
  bgPage:    '#f0ede6',
  bgContent: '#ffffff',
  bgHeader:  '#1a2a3a',
  bgFooter:  '#1a1a1a',
  textPrimary:   '#1a1a1a',
  textSecondary: '#555555',
  textLight:     '#888888',
  textWhite:     '#ffffff',
  accent:    '#c27b2c',   // gold / amber
  navy:      '#1a2a3a',
  border:    '#d8d4cc',
  divider:   '#e8e5df',
}

export const F = {
  serif: 'Georgia, "Times New Roman", Times, serif',
  sans:  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}

interface ShellProps {
  previewText: string
  children: React.ReactNode
  unsubscribeUrl?: string   // pass the HMAC-signed URL; undefined = no unsubscribe link
  footerNote?: string
}

export function EmailShell({ previewText, children, unsubscribeUrl, footerNote }: ShellProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: C.bgPage, margin: 0, padding: 0, fontFamily: F.sans }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Container style={{ maxWidth: 600, margin: '0 auto' }}>
          <Section style={{ backgroundColor: C.bgHeader, padding: '28px 32px' }}>
            <Text style={{
              fontFamily: F.serif,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: C.accent,
              margin: '0 0 4px 0',
            }}>
              The Nigerian Economist
            </Text>
            <Text style={{
              fontFamily: F.serif,
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              margin: 0,
            }}>
              Independent economic analysis
            </Text>
          </Section>

          {/* ── Content ──────────────────────────────────────── */}
          <Section style={{ backgroundColor: C.bgContent, padding: '36px 40px' }}>
            {children}
          </Section>

          {/* ── Footer ───────────────────────────────────────── */}
          <Section style={{ backgroundColor: C.bgFooter, padding: '24px 32px' }}>
            {footerNote && (
              <Text style={{ fontFamily: F.sans, fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px 0' }}>
                {footerNote}
              </Text>
            )}
            <Row>
              <Column>
                <Text style={{ fontFamily: F.sans, fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: '1.6' }}>
                  The Nigerian Economists · Lagos, Nigeria{'\n'}
                  <Link href="https://thenigerianeconomists.com" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    thenigerianeconomists.com
                  </Link>
                </Text>
              </Column>
              {unsubscribeUrl && (
                <Column align="right">
                  <Link href={unsubscribeUrl} style={{ fontFamily: F.sans, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                    Unsubscribe
                  </Link>
                </Column>
              )}
            </Row>
          </Section>
        </Container>

      </Body>
    </Html>
  )
}

// Convenience: a horizontal rule styled for content area
export function ContentDivider() {
  return <Hr style={{ borderColor: C.divider, margin: '24px 0' }} />
}

// Article card used in newsletter templates
export interface ArticleCard {
  headline: string
  deck?: string
  kicker?: string
  slug: string
  authorName: string
  topicName?: string
  readMinutes?: number
}

export function ArticleCardBlock({ article, baseUrl }: { article: ArticleCard; baseUrl: string }) {
  const url = `${baseUrl}/articles/${article.slug}`
  return (
    <Section style={{ marginBottom: 24 }}>
      {article.kicker && (
        <Text style={{
          fontFamily: F.sans, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.accent, margin: '0 0 4px 0',
        }}>
          {article.kicker}
        </Text>
      )}
      <Link href={url} style={{ textDecoration: 'none' }}>
        <Text style={{
          fontFamily: F.serif, fontSize: 18, fontWeight: 700,
          color: C.textPrimary, lineHeight: '1.3', margin: '0 0 6px 0',
        }}>
          {article.headline}
        </Text>
      </Link>
      {article.deck && (
        <Text style={{
          fontFamily: F.sans, fontSize: 14, color: C.textSecondary,
          lineHeight: '1.5', margin: '0 0 8px 0',
        }}>
          {article.deck}
        </Text>
      )}
      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.textLight, margin: 0 }}>
        {article.authorName}
        {article.readMinutes ? ` · ${article.readMinutes} min read` : ''}
      </Text>
    </Section>
  )
}
