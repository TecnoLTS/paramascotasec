import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Instrument_Sans } from 'next/font/google'
import '@/styles/styles.scss'
import GlobalProvider from './GlobalProvider'
import ClientModals from './ClientModals'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'
import { getSiteConfig } from '@/lib/site'
import { versionLocalImagePath } from '@/lib/staticAsset'
import { generatePetStoreJsonLd, generateWebSiteJsonLd } from '@/lib/seo'
import { getCanonicalSiteUrl } from '@/lib/publicUrl'

const instrument = Instrument_Sans({ subsets: ['latin'], display: 'swap' })
const serverTimeLeft: CountdownTimeType = countdownTime();

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig()
  const siteUrl = getCanonicalSiteUrl()
  const ogImage = versionLocalImagePath('/images/slider/bg-pet1-1.png')

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: site.name,
      description: site.description,
      url: siteUrl,
      siteName: site.name,
      locale: 'es_ES',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${site.name} - Ecommerce`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: site.description,
      images: [ogImage],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const nonce = requestHeaders.get('x-nonce') || undefined
  const site = getSiteConfig()
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head />
      <body className={instrument.className}>
        <GlobalProvider>
          <div id="app-root">
            {children}
          </div>
          <ClientModals serverTimeLeft={serverTimeLeft} />
          <script
            nonce={nonce}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generatePetStoreJsonLd(site))
            }}
          />
          <script
            nonce={nonce}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateWebSiteJsonLd(site))
            }}
          />
        </GlobalProvider>
      </body>
    </html>
  )
}
