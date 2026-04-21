import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Instrument_Sans } from 'next/font/google'
import 'swiper/css/bundle'
import '@/styles/styles.scss'
import GlobalProvider from './GlobalProvider'
import ClientModals from './ClientModals'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'
import { getSiteConfig } from '@/lib/site'
import { versionLocalImagePath } from '@/lib/staticAsset'
import { fetchSuggestionsData } from '@/lib/server/suggestions'

const instrument = Instrument_Sans({ subsets: ['latin'], preload: false })
const serverTimeLeft: CountdownTimeType = countdownTime();

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig()
  const siteUrl = site.baseUrl.replace(/\/$/, '')
  const ogImage = versionLocalImagePath('/images/slider/bg-pet1-1.png')

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
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
  const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  const forwardedProto = requestHeaders.get('x-forwarded-proto')
  const site = getSiteConfig()
  const siteUrl = site.baseUrl.replace(/\/$/, '')
  const logoImage = versionLocalImagePath(site.logo.src)
  const sameAs = [site.social.facebook, site.social.instagram, site.social.twitter, site.social.youtube].filter(Boolean)
  const initialSuggestions = await fetchSuggestionsData({
    host: forwardedHost,
    proto: forwardedProto || new URL(siteUrl).protocol.replace(':', ''),
    limit: 4,
  }).catch(() => [])
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={instrument.className}>
        <GlobalProvider>
          <div id="app-root">
            {children}
          </div>
          <ClientModals serverTimeLeft={serverTimeLeft} initialSuggestions={initialSuggestions} />
          <script
            nonce={nonce}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: site.name,
                url: siteUrl,
                logo: `${siteUrl}${logoImage}`,
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: site.contact.whatsappLabel,
                  contactType: 'customer service',
                  areaServed: 'EC',
                  availableLanguage: 'Spanish'
                },
                sameAs
              })
            }}
          />
        </GlobalProvider>
      </body>
    </html>
  )
}
