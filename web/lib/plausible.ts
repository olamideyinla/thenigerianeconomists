type BreakdownResult = { page: string; pageviews: number }

/**
 * Fetch all-time pageviews for every /articles/* page from the Plausible
 * Stats API.  Returns a map of { slug → pageviews }.
 *
 * Returns an empty object (silently) when PLAUSIBLE_API_KEY or
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN is not set, or if the API call fails.
 */
export async function getArticlePageViews(): Promise<Record<string, number>> {
  const apiKey = process.env.PLAUSIBLE_API_KEY
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  if (!apiKey || !domain) return {}

  const params = new URLSearchParams({
    site_id: domain,
    period: 'all',
    property: 'event:page',
    filters: 'event:page==/articles/**',
    metrics: 'pageviews',
    limit: '1000',
  })

  try {
    const res = await fetch(
      `https://plausible.io/api/v1/stats/breakdown?${params}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 }, // cache for 1 hour
      },
    )
    if (!res.ok) return {}

    const { results } = (await res.json()) as { results: BreakdownResult[] }
    return Object.fromEntries(
      (results ?? []).map((r) => [
        r.page.replace(/^\/articles\//, ''),
        r.pageviews ?? 0,
      ]),
    )
  } catch {
    return {}
  }
}
