import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { CarbonProvider } from '@/lib/context'
import { CustomCursor } from '@/components/ui/custom-cursor'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})
const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'CARBON·LEDGER — Personal ESG Intelligence Terminal',
  description:
    'A deterministic sustainability terminal: composite ESG scoring, carbon-budget depletion modeling, anomaly detection, and 10-year scenario projection.',
  keywords: [
    'carbon footprint',
    'ESG scoring',
    'sustainability',
    'climate change',
    'GHG protocol',
    'carbon calculator',
    'Paris Agreement',
    'net zero',
    'emission tracking',
  ],
  authors: [{ name: 'Carbon Ledger Contributors' }],
  openGraph: {
    title: 'CARBON·LEDGER — Personal ESG Intelligence Terminal',
    description:
      'Track, analyze, and reduce your personal carbon footprint with deterministic ESG scoring and 10-year scenario projection.',
    type: 'website',
    locale: 'en_US',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <CustomCursor />
        <CarbonProvider>
          {children}
        </CarbonProvider>
      </body>
    </html>
  )
}
