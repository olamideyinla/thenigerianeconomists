import { Meilisearch } from 'meilisearch'

const INDEX_NAME = 'articles'

let _client: Meilisearch | null = null

function getClient(): Meilisearch {
  if (!_client) {
    const host = process.env.MEILI_HOST ?? 'http://localhost:7700'
    const apiKey = process.env.MEILI_API_KEY ?? 'masterKey'
    _client = new Meilisearch({ host, apiKey })
  }
  return _client
}

export type ArticleDoc = {
  id: string
  slug: string
  headline: string
  deck: string
  kicker: string
  contentText: string   // plain text stripped from MDX for full-text search
  authorName: string
  topicSlug: string
  topicName: string
  publishedAt: number   // Unix ms timestamp — used for sorting/filtering
  readMinutes: number
}

export interface SearchHit {
  id: string
  slug: string
  headline: string
  deck: string
  kicker: string
  authorName: string
  topicSlug: string
  topicName: string
  publishedAt: number
  readMinutes: number
  _formatted?: {
    headline?: string
    deck?: string
    contentText?: string
  }
}

export interface SearchResponse {
  hits: SearchHit[]
  totalHits: number
  query: string
}

/** Strip MDX syntax and {{N}} citation tokens to produce plain searchable text. */
export function mdxToSearchText(mdx: string): string {
  return mdx
    .replace(/\{\{(\d+)\}\}/g, '')           // citation tokens
    .replace(/^#+\s+/gm, '')                  // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')          // bold
    .replace(/\*(.+?)\*/g, '$1')              // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')        // code
    .replace(/^:::[\w-]+.*$/gm, '')           // directives
    .replace(/<[^>]+>/g, '')                  // JSX/HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function indexArticle(doc: ArticleDoc): Promise<void> {
  try {
    const client = getClient()
    await client.index(INDEX_NAME).addDocuments([doc])
  } catch (err) {
    // Never block publishing if Meilisearch is down
    console.error('[search] indexArticle failed:', err)
  }
}

export async function removeFromIndex(id: string): Promise<void> {
  try {
    const client = getClient()
    await client.index(INDEX_NAME).deleteDocument(id)
  } catch (err) {
    console.error('[search] removeFromIndex failed:', err)
  }
}

export async function searchArticles(
  query: string,
  opts: { topicSlug?: string; limit?: number; offset?: number } = {},
): Promise<SearchResponse> {
  const client = getClient()

  const filter: string[] = []
  if (opts.topicSlug) filter.push(`topicSlug = "${opts.topicSlug}"`)

  const res = await client.index(INDEX_NAME).search<SearchHit>(query, {
    limit: opts.limit ?? 20,
    offset: opts.offset ?? 0,
    attributesToHighlight: ['headline', 'deck', 'contentText'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['contentText'],
    cropLength: 30,
    filter: filter.length ? filter : undefined,
    sort: ['publishedAt:desc'],
  })

  return {
    hits: res.hits,
    totalHits: res.estimatedTotalHits ?? res.hits.length,
    query,
  }
}

/** Configure the index settings once on startup (idempotent). */
export async function configureIndex(): Promise<void> {
  const client = getClient()
  const index = client.index(INDEX_NAME)
  await index.updateSettings({
    searchableAttributes: [
      'headline',
      'deck',
      'kicker',
      'contentText',
      'authorName',
      'topicName',
    ],
    filterableAttributes: ['topicSlug', 'publishedAt'],
    sortableAttributes: ['publishedAt'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    displayedAttributes: [
      'id',
      'slug',
      'headline',
      'deck',
      'kicker',
      'authorName',
      'topicSlug',
      'topicName',
      'publishedAt',
      'readMinutes',
    ],
  })
}
