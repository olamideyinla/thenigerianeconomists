// prisma/seed.ts — seeds prototype data from design/data.jsx
import 'dotenv/config'
import { PrismaClient, ArticleStatus, RebuttalStance, FigureKind, FigureWidth, ChartType, AxisFormat, UserRole, FunderType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱  Seeding database…')

  // ── System admin user (needed for MediaAsset.uploadedBy) ─────────
  const sysUser = await db.user.upsert({
    where: { email: 'admin@thenigerianeconomists.com' },
    update: {},
    create: {
      email: 'admin@thenigerianeconomists.com',
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
  })

  // ── Authors ────────────────────────────────────────────────────────
  const authorIyamah = await db.author.upsert({
    where: { slug: 'adesuwa-iyamah' },
    update: {},
    create: {
      slug: 'adesuwa-iyamah',
      name: 'Adesuwa Iyamah',
      initials: 'AI',
      role: 'Senior Economist',
      affiliation: 'Independent; previously CBN Monetary Policy Department, 2014–2021',
      bio: "Adesuwa writes on monetary policy, FX markets, and the political economy of central banking. Her 2023 paper on Naira convertibility is widely cited in policy circles.",
      isStaff: true,
      disclosures: {
        create: [
          { text: 'Holds no equity in any Nigerian bank or BDC operator.' },
          { text: 'Consulted for the Lagos State Ministry of Economic Planning, Jan–Apr 2025.' },
          { text: 'Spouse is employed by a Tier-2 commercial bank; recuses from coverage of that institution.' },
        ],
      },
    },
  })

  const authorOkoro = await db.author.upsert({
    where: { slug: 'chuka-okoro' },
    update: {},
    create: {
      slug: 'chuka-okoro',
      name: 'Chuka Okoro',
      initials: 'CO',
      role: 'Contributing Editor, Fiscal Policy',
      affiliation: 'Centre for the Study of the Economies of Africa (CSEA)',
      bio: 'Chuka covers fiscal policy, subsidy reform, and subnational debt. He served on the Presidential Fiscal Reform Committee in 2023.',
      isStaff: true,
      disclosures: {
        create: [
          { text: 'Member, Presidential Fiscal Reform Committee, 2023 (unpaid).' },
          { text: 'No consulting engagements with state governments in the past 24 months.' },
        ],
      },
    },
  })

  const authorBello = await db.author.upsert({
    where: { slug: 'fatima-bello' },
    update: {},
    create: {
      slug: 'fatima-bello',
      name: 'Fatima Bello',
      initials: 'FB',
      role: 'Contributor',
      affiliation: 'PhD candidate, LSE; formerly NBS',
      bio: "Fatima's research concerns household consumption, inflation measurement, and labour markets in northern Nigeria.",
      isStaff: false,
      disclosures: {
        create: [
          { text: 'Funded by a Mastercard Foundation graduate fellowship.' },
          { text: 'No paid policy work in the past 12 months.' },
        ],
      },
    },
  })

  const authorAluko = await db.author.upsert({
    where: { slug: 'tunde-aluko' },
    update: {},
    create: {
      slug: 'tunde-aluko',
      name: 'Tunde Aluko',
      initials: 'TA',
      role: 'Columnist, Markets',
      affiliation: 'Independent',
      bio: 'Tunde has covered Nigerian capital markets for two decades, most recently as a buy-side analyst.',
      isStaff: false,
      disclosures: {
        create: [
          { text: 'Personal portfolio holdings disclosed quarterly; current disclosure dated 03 May 2026.' },
        ],
      },
    },
  })

  console.log('  ✓ Authors + COI disclosures')

  // ── Topics ─────────────────────────────────────────────────────────
  const topicData = [
    { slug: 'fx',          name: 'FX & Monetary Policy',  displayOrder: 1 },
    { slug: 'fiscal',      name: 'Fiscal Policy',          displayOrder: 2 },
    { slug: 'subnational', name: 'Subnational',             displayOrder: 3 },
    { slug: 'subsidy',     name: 'Subsidy & Energy',       displayOrder: 4 },
    { slug: 'banking',     name: 'Banking & Finance',      displayOrder: 5 },
    { slug: 'labour',      name: 'Labour & Inflation',     displayOrder: 6 },
    { slug: 'welfare',     name: 'Welfare Economics',      displayOrder: 7 },
    { slug: 'health',      name: 'Health Economics',       displayOrder: 8 },
    { slug: 'behavioural', name: 'Behavioural Economics',  displayOrder: 9 },
    { slug: 'trade',       name: 'Trade & AfCFTA',         displayOrder: 10 },
    { slug: 'political',   name: 'Political Economy',      displayOrder: 11 },
  ]
  const topics: Record<string, { id: string }> = {}
  for (const t of topicData) {
    topics[t.slug] = await db.topic.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    })
  }
  console.log('  ✓ Topics (11)')

  // ── Main article — FX Phantom Liquidity ───────────────────────────
  const fxMdx = `
## 1. The 09:45 spike

On 71 of 84 trading days in the sample, more than 60% of daily NAFEM turnover cleared in a 15-minute window between 09:30 and 09:45. This is not how interbank markets behave. In Johannesburg, Nairobi, or any deep market you would like to name, turnover distributes across the day in something approximating a U-shape. A clearing burst at the open is the signature of a fixing — of trades pre-matched off-book and reported into the window for price discovery purposes.

The Governor has argued that the morning spike reflects 'efficient liquidity provision by market-making banks'. The order data do not support this reading. On 62 days, the same two dealers were on both sides of more than 40% of the morning's clearing volume — a pattern more consistent with intra-group settlement than with market-making.

## 2. The disclosed turnover is gross, not net

NAFEM disclosures aggregate every reported trade, but make no adjustment for reversals or for the now-routine practice of round-tripping a position through an offshore subsidiary to satisfy onshore reporting. On the days I examined, an estimated 18–24% of disclosed turnover was reversed within the same session. The CBN is aware of this; the Research Department's own internal memo of February 2026, which I have seen, acknowledges 'material double-counting' in the published series.

> A clearing burst at the open is the signature of a fixing — not a market.

Adjusting for this, effective NAFEM turnover in Q1 2026 was roughly ₦480bn weekly, against published figures of ₦620bn. That is still an improvement over the 2023 baseline. It is not the breakthrough the published numbers imply.

## 3. The rate is pegged, just quietly

The official NAFEM rate has moved within a 2.1% band over the four-month sample, despite parallel-market pressure of 11–14% over the same period. A market in which the rate moves within such a tight band, while a substantial premium persists in an adjacent market, is a market that is being managed.

## What this means for the June MPC

If the FX window is thinner than disclosed turnover suggests, the case for further tightening at the June MPC is stronger than the Committee's current minutes imply. The premium does not close itself. The Committee's options narrow as 2026 progresses.
`.trim()

  const articleFx = await db.article.upsert({
    where: { slug: 'phantom-liquidity-fx-window' },
    update: {},
    create: {
      slug: 'phantom-liquidity-fx-window',
      kicker: 'Monetary Policy',
      headline: "The Phantom Liquidity in Nigeria's FX Window",
      deck: "The CBN's published turnover figures suggest a market that is thickening. The order book tells a different story — and the gap between them is where policy mistakes are made.",
      authorId: authorIyamah.id,
      topicId: topics['fx'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-08T08:00:00Z'),
      wordCount: 3120,
      readMinutes: 14,
      contentMdx: fxMdx,
      excerpt: "The CBN's NAFEM window shows doubled turnover. The order book shows a thin market dressed up as a thick one.",
      references: {
        create: [
          { indexNumber: 1,  author: 'CBN', year: '2024', title: 'Operational Guidelines for the Nigerian Autonomous Foreign Exchange Market', publication: 'CBN Circular FMD/DIR/PUB/CIR/01/021', url: 'https://cbn.gov.ng/fmd-021' },
          { indexNumber: 2,  author: 'CBN', year: '2026', title: 'Monetary Policy Committee Communiqué No. 304', publication: 'CBN, March 2026', url: 'https://cbn.gov.ng/mpc-304' },
          { indexNumber: 3,  author: "Author's analysis", year: '2026', title: 'Anonymised intraday quote-and-deal data, four authorised dealers, Jan–Apr 2026', publication: 'On file with the author; data sharing agreement restricts redistribution.' },
          { indexNumber: 4,  author: 'Iyamah, A.', year: '2026', title: 'Time-of-day distribution of NAFEM clearing volume, Q1 2026', publication: 'Working paper, draft on file.' },
          { indexNumber: 5,  author: 'Cardoso, O.', year: '2026', title: 'Address to the Chartered Institute of Bankers of Nigeria, 14 April 2026', publication: 'CIBN Lagos, 2026' },
          { indexNumber: 6,  author: 'Adeyemi, T. & Sani, R.', year: '2025', title: 'Round-tripping in the post-2024 NAFEM regime', publication: 'CSEA Working Paper 25-11' },
          { indexNumber: 7,  author: 'CBN Research Dept.', year: '2026', title: 'Internal memo on aggregation methodology, NAFEM disclosures', publication: 'February 2026, restricted circulation; cited with permission.' },
          { indexNumber: 8,  author: "Author's calculation", year: '2026', title: 'Reversal-adjusted NAFEM turnover series, Q1 2026' },
          { indexNumber: 9,  author: 'FMDQ Exchange', year: '2026', title: 'Parallel market reference rate, weekly close', publication: 'FMDQ, Jan–Apr 2026' },
          { indexNumber: 10, author: 'Rey, H.', year: '2015', title: 'Dilemma not Trilemma: the Global Financial Cycle and Monetary Policy Independence', publication: 'NBER Working Paper 21162' },
          { indexNumber: 11, author: 'CBN', year: '2025', title: 'Monetary Policy Framework Review, 2025', publication: 'CBN, November 2025' },
          { indexNumber: 12, author: 'CBN MPC', year: '2026', title: 'Minutes of the May 2026 Monetary Policy Committee meeting', publication: 'CBN, published 02 May 2026' },
        ],
      },
    },
  })
  console.log('  ✓ Article: phantom-liquidity-fx-window (+ 12 references)')

  // ── Two rebuttal stub articles ─────────────────────────────────────
  const articleFxRebuttal1 = await db.article.upsert({
    where: { slug: 'phantom-liquidity-response-okeke' },
    update: {},
    create: {
      slug: 'phantom-liquidity-response-okeke',
      kicker: 'Response',
      headline: 'Reading the NAFEM Tape Correctly',
      deck: "A reply to Adesuwa Iyamah's analysis of NAFEM turnover data.",
      authorId: authorOkoro.id, // placeholder — Okeke not in prototype authors
      topicId: topics['fx'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-11T08:00:00Z'),
      wordCount: 1200,
      readMinutes: 5,
      contentMdx: 'Full response text to follow.',
    },
  })

  const articleFxRebuttal2 = await db.article.upsert({
    where: { slug: 'phantom-liquidity-cbn-note' },
    update: {},
    create: {
      slug: 'phantom-liquidity-cbn-note',
      kicker: 'Response',
      headline: 'A Note on Aggregated Turnover Disclosures',
      deck: 'The CBN Research Department responds to recent analysis of NAFEM disclosure methodology.',
      authorId: authorOkoro.id,
      topicId: topics['fx'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-10T08:00:00Z'),
      wordCount: 800,
      readMinutes: 4,
      contentMdx: 'Full CBN note to follow.',
    },
  })

  // ── Rebuttal relationships ─────────────────────────────────────────
  await db.rebuttal.createMany({
    skipDuplicates: true,
    data: [
      { originalArticleId: articleFx.id, rebuttalArticleId: articleFxRebuttal1.id, stance: RebuttalStance.REBUTS },
      { originalArticleId: articleFx.id, rebuttalArticleId: articleFxRebuttal2.id, stance: RebuttalStance.REBUTS },
    ],
  })
  console.log('  ✓ Rebuttal relationships')

  // ── Remaining articles ─────────────────────────────────────────────
  const articleSubsidy = await db.article.upsert({
    where: { slug: 'subsidy-three-years-on' },
    update: {},
    create: {
      slug: 'subsidy-three-years-on',
      kicker: 'Subsidy & Energy',
      headline: 'Three Years After Removal, The Subsidy Is Back. We Just Stopped Calling It That.',
      deck: "Implicit subsidisation through the NNPCL's pricing committee has reached an estimated ₦1.8tn annualised. The fiscal arithmetic the 2023 reform was meant to fix has reasserted itself.",
      authorId: authorOkoro.id,
      topicId: topics['subsidy'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-06T08:00:00Z'),
      wordCount: 2400,
      readMinutes: 11,
      contentMdx: 'Full article text to follow.',
    },
  })

  const articleSubsidyRebuttal = await db.article.upsert({
    where: { slug: 'subsidy-nnpcl-response' },
    update: {},
    create: {
      slug: 'subsidy-nnpcl-response',
      kicker: 'Response',
      headline: 'On Cost-Recovery Pricing',
      deck: 'NNPCL Office of the GCEO responds.',
      authorId: authorOkoro.id,
      topicId: topics['subsidy'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-07T08:00:00Z'),
      wordCount: 600,
      readMinutes: 3,
      contentMdx: 'Full response to follow.',
    },
  })

  await db.rebuttal.createMany({
    skipDuplicates: true,
    data: [
      { originalArticleId: articleSubsidy.id, rebuttalArticleId: articleSubsidyRebuttal.id, stance: RebuttalStance.REBUTS },
    ],
  })

  const articleNorthernInflation = await db.article.upsert({
    where: { slug: 'northern-inflation-divergence' },
    update: {},
    create: {
      slug: 'northern-inflation-divergence',
      kicker: 'Inflation',
      headline: 'The Northern Inflation Divergence Is Not a Measurement Artefact',
      deck: 'Food inflation in Kano and Borno has held 4–6 points above the headline number for eleven consecutive months. The NBS basket is not the problem.',
      authorId: authorBello.id,
      topicId: topics['labour'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-04T08:00:00Z'),
      wordCount: 1980,
      readMinutes: 9,
      contentMdx: 'Full article text to follow.',
    },
  })

  const articleHealthCapitation = await db.article.upsert({
    where: { slug: 'primary-health-capitation-failure' },
    update: {},
    create: {
      slug: 'primary-health-capitation-failure',
      kicker: 'Health Economics',
      headline: 'The Quiet Collapse of Primary-Health Capitation in Eight Northern States',
      deck: 'The 2024 NHIA reforms were meant to fix purchasing. Two years on, primary health centres in Kano, Sokoto and Zamfara are receiving capitation transfers a quarter late and at 60 per cent of formula.',
      authorId: authorBello.id,
      topicId: topics['health'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-05-01T08:00:00Z'),
      wordCount: 1980,
      readMinutes: 9,
      contentMdx: 'Full article text to follow.',
    },
  })

  const articleAfcfta = await db.article.upsert({
    where: { slug: 'afcfta-customs-quiet-failure' },
    update: {},
    create: {
      slug: 'afcfta-customs-quiet-failure',
      kicker: 'Trade',
      headline: "AfCFTA's Quiet Failure at the Customs Counter",
      deck: 'Tariff schedules are not the binding constraint. The forms are.',
      authorId: authorOkoro.id,
      topicId: topics['trade'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-04-29T08:00:00Z'),
      wordCount: 1760,
      readMinutes: 8,
      contentMdx: 'Full article text to follow.',
    },
  })

  const articleBanks = await db.article.upsert({
    where: { slug: 'tier-2-banks-recapitalisation' },
    update: {},
    create: {
      slug: 'tier-2-banks-recapitalisation',
      kicker: 'Banking',
      headline: 'The Tier-2 Banks Will Not All Make the Recapitalisation Deadline. The Question Is Which.',
      deck: 'Five names, the maths on each, and what an orderly resolution would look like.',
      authorId: authorAluko.id,
      topicId: topics['banking'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-04-27T08:00:00Z'),
      wordCount: 2640,
      readMinutes: 12,
      contentMdx: 'Full article text to follow.',
    },
  })

  const articleBanksRebuttal = await db.article.upsert({
    where: { slug: 'banks-cfo-response' },
    update: {},
    create: {
      slug: 'banks-cfo-response',
      kicker: 'Response',
      headline: 'On Risk-Weighted Assets and the Recapitalisation Maths',
      deck: 'Anonymous, Tier-2 Bank CFO responds.',
      authorId: authorAluko.id,
      topicId: topics['banking'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-04-29T08:00:00Z'),
      wordCount: 900,
      readMinutes: 4,
      contentMdx: 'Full response to follow.',
    },
  })

  await db.rebuttal.createMany({
    skipDuplicates: true,
    data: [
      { originalArticleId: articleBanks.id, rebuttalArticleId: articleBanksRebuttal.id, stance: RebuttalStance.REBUTS },
    ],
  })

  const articleMinWage = await db.article.upsert({
    where: { slug: 'minimum-wage-real-erosion' },
    update: {},
    create: {
      slug: 'minimum-wage-real-erosion',
      kicker: 'Labour',
      headline: 'The ₦70,000 Minimum Wage, in Real Terms, Is Already Below the 2019 Floor',
      deck: 'The agreement was signed eleven months ago. CPI has done the rest.',
      authorId: authorBello.id,
      topicId: topics['labour'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-04-24T08:00:00Z'),
      wordCount: 1540,
      readMinutes: 7,
      contentMdx: 'Full article text to follow.',
    },
  })

  const articleStates = await db.article.upsert({
    where: { slug: 'states-debt-overhang' },
    update: {},
    create: {
      slug: 'states-debt-overhang',
      kicker: 'Subnational Fiscal',
      headline: 'Six States Are Insolvent on Any Reasonable Definition. The FAAC Cushion Is Disappearing.',
      deck: 'The 2025 federation account boom is unwinding. The states that spent it are now exposed.',
      authorId: authorOkoro.id,
      topicId: topics['subnational'].id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-04-20T08:00:00Z'),
      wordCount: 2200,
      readMinutes: 10,
      contentMdx: 'Full article text to follow.',
    },
  })

  console.log('  ✓ Articles (8 primary + 4 rebuttal stubs)')

  // ── Synthesis ──────────────────────────────────────────────────────
  const synthesis = await db.synthesis.upsert({
    where: { slug: 'fiscal-monetary-misalignment-may-2026' },
    update: {},
    create: {
      slug: 'fiscal-monetary-misalignment-may-2026',
      issueNumber: 18,
      weekOf: new Date('2026-05-12T00:00:00Z'),
      title: "Fiscal-Monetary Misalignment: Where The Numbers Don't Add Up",
      contentMdx: "Five pieces published over the last fortnight describe a single problem from five angles. Read together, they suggest the 2026 budget framework rests on revenue and inflation assumptions that the markets have already stopped believing.",
      editorId: authorIyamah.id,
      publishedAt: new Date('2026-05-12T08:00:00Z'),
    },
  })

  const synthArticles = [
    { articleId: articleStates.id, order: 1 },
    { articleId: articleSubsidy.id, order: 2 },
    { articleId: articleFx.id, order: 3 },
    { articleId: articleNorthernInflation.id, order: 4 },
    { articleId: articleMinWage.id, order: 5 },
    { articleId: articleBanks.id, order: 6 },
  ]
  for (const sa of synthArticles) {
    await db.synthesisArticle.upsert({
      where: { synthesisId_articleId: { synthesisId: synthesis.id, articleId: sa.articleId } },
      update: {},
      create: { synthesisId: synthesis.id, ...sa },
    })
  }
  console.log('  ✓ Synthesis Issue 18 (6 articles)')

  // ── Figures on the FX article: DataTable + ChartNative ─────────────

  // Figure 1 — DataTable: Weekly NAFEM turnover (published vs adjusted)
  const figTable = await db.figure.upsert({
    where: { id: 'fig-nafem-table-01' },
    update: {},
    create: {
      id: 'fig-nafem-table-01',
      articleId: articleFx.id,
      kind: FigureKind.TABLE,
      position: 1,
      caption: 'Weekly NAFEM turnover: CBN-published figures versus reversal-adjusted estimates, Q1 2026',
      source: "Author's calculation from anonymised dealer data; CBN weekly disclosures.",
      width: FigureWidth.COLUMN,
      dataTable: {
        create: {
          headers: ['Week ending', 'Published (₦bn)', 'Reversal-adjusted (₦bn)', 'Implied discount (%)'],
          rows: [
            ['03 Jan 2026', '598', '465', '22.2'],
            ['10 Jan 2026', '612', '478', '21.9'],
            ['17 Jan 2026', '625', '490', '21.6'],
            ['24 Jan 2026', '609', '474', '22.2'],
            ['31 Jan 2026', '618', '481', '22.2'],
            ['07 Feb 2026', '631', '494', '21.7'],
            ['14 Feb 2026', '638', '498', '21.9'],
            ['21 Feb 2026', '644', '505', '21.6'],
            ['28 Feb 2026', '629', '490', '22.1'],
            ['07 Mar 2026', '651', '510', '21.7'],
            ['14 Mar 2026', '658', '515', '21.7'],
            ['21 Mar 2026', '662', '519', '21.6'],
            ['Q1 avg', '623', '485', '22.1'],
          ],
          columnAlignments: ['left', 'right', 'right', 'right'],
          columnFormats: ['TEXT', 'NUMBER', 'NUMBER', 'PERCENT'],
          sourceNote: "CBN weekly FX market disclosures; author's reversal-adjustment methodology described in Reference 8.",
        },
      },
    },
  })

  // Figure 2 — ChartNative: intraday clearing spike pattern
  const figChart = await db.figure.upsert({
    where: { id: 'fig-nafem-spike-01' },
    update: {},
    create: {
      id: 'fig-nafem-spike-01',
      articleId: articleFx.id,
      kind: FigureKind.CHART_NATIVE,
      position: 2,
      caption: 'Intraday distribution of NAFEM clearing volume, mean across 84 trading days (Jan–Apr 2026)',
      source: "Author's analysis of anonymised intraday dealer data (Reference 3). Four authorised dealing banks, representing 86% of disclosed NAFEM volume.",
      width: FigureWidth.COLUMN,
      chartNative: {
        create: {
          chartType: ChartType.LINE,
          xAxisLabel: 'Time of day (Lagos, WAT)',
          yAxisLabel: '% of daily turnover',
          xAxisFormat: AxisFormat.TEXT,
          yAxisFormat: AxisFormat.PERCENT,
          dataJson: [
            { time: '09:00–09:15', nafem: 3.2,  reference: 8.1  },
            { time: '09:15–09:30', nafem: 5.8,  reference: 9.4  },
            { time: '09:30–09:45', nafem: 61.4, reference: 11.2 },
            { time: '09:45–10:00', nafem: 4.1,  reference: 10.8 },
            { time: '10:00–11:00', nafem: 5.9,  reference: 12.3 },
            { time: '11:00–12:00', nafem: 4.3,  reference: 11.7 },
            { time: '12:00–13:00', nafem: 3.8,  reference: 10.9 },
            { time: '13:00–14:00', nafem: 3.7,  reference: 10.4 },
            { time: '14:00–15:00', nafem: 4.2,  reference: 9.6  },
            { time: '15:00–16:00', nafem: 3.6,  reference: 5.6  },
          ],
          series: [
            { key: 'nafem',    label: 'NAFEM (Nigeria)',      color: 'var(--chart-series-1)' },
            { key: 'reference', label: 'Reference market avg', color: 'var(--chart-series-2)' },
          ],
          annotations: [
            {
              x: '09:30–09:45',
              label: '61% of daily volume\nclears in 15 min',
              position: 'top',
            },
          ],
          showLegend: true,
          showGridlines: true,
          sourceNote: "Reference market = simple average of JSE, NSE-Nairobi intraday profiles (FMDQ Exchange, 2026).",
        },
      },
    },
  })

  console.log('  ✓ Figures: DataTable (NAFEM turnover) + ChartNative (09:45 spike)')
  console.log('  ✓ Figure IDs:', figTable.id, figChart.id)

  // ── Funders ───────────────────────────────────────────────────────
  await db.funder.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Omidyar Network',
        type: FunderType.FOUNDATION,
        amountRange: '$50,000–$100,000',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2026-12-31'),
        description: 'General operating support for independent economic journalism.',
        displayOrder: 1,
        isCurrent: true,
      },
      {
        name: 'Reader memberships',
        type: FunderType.READER_REVENUE,
        amountRange: '₦2.4m–₦4.8m/year',
        periodStart: new Date('2024-07-01'),
        description: 'Annual and monthly reader memberships.',
        displayOrder: 2,
        isCurrent: true,
      },
    ],
  })
  console.log('  ✓ Funders')

  console.log('\n✅  Seed complete.')
  console.log(`   Articles: 12 (8 primary + 4 rebuttal stubs)`)
  console.log(`   Authors: 4 | Topics: 11 | Figures: 2`)
  console.log(`   Synthesis: 1 (Issue 18, 6 articles)`)
}

main()
  .catch(e => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
