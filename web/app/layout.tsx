import type { Metadata } from 'next'
import Script from 'next/script'
import {
  Fraunces,
  Newsreader,
  Public_Sans,
  Instrument_Serif,
  Source_Serif_4,
  Bricolage_Grotesque,
  Geist_Mono,
} from 'next/font/google'
import '@/styles/theme.css'
import '@/styles/styles-base.css'
import '@/styles/styles-article.css'
import '@/styles/styles-pages.css'
import '@/styles/styles-reader.css'
import '@/styles/styles-desktop.css'
import '@/styles/styles-media.css'
import '@/styles/globals.css'

/* ── Fonts (self-hosted via next/font) ──────────────────────────── */

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
  weight: '400',
  style: ['normal', 'italic'],
})

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
  style: ['normal', 'italic'],
  axes: ['opsz'],
})

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
})

/* ── Metadata ───────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'The Nigerian Economists',
    template: '%s | The Nigerian Economists',
  },
  description: 'Rigorous economic analysis and commentary on Nigeria and Africa.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

/* ── Root layout ────────────────────────────────────────────────── */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    fraunces.variable,
    newsreader.variable,
    publicSans.variable,
    instrumentSerif.variable,
    sourceSerif4.variable,
    bricolageGrotesque.variable,
    geistMono.variable,
  ].join(' ')

  return (
    <html lang="en" className={fontVars}>
      <body>
        {children}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.tagged-events.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
