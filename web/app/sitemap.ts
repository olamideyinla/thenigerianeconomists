import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authors, topics, syntheses] = await Promise.all([
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    db.author.findMany({
      select: { slug: true, updatedAt: true },
    }),
    db.topic.findMany({
      select: { slug: true },
    }),
    db.synthesis.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, publishedAt: true },
    }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE}/synthesis`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/rebuttals`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/transparency`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/corrections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ]

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  const authorPages: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${BASE}/authors/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const topicPages: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${BASE}/topics/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const synthesisPages: MetadataRoute.Sitemap = syntheses.map((s) => ({
    url: `${BASE}/synthesis/${s.slug}`,
    lastModified: s.publishedAt ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...articlePages,
    ...authorPages,
    ...topicPages,
    ...synthesisPages,
  ]
}
