import type { Metadata } from 'next'
import { Instrument_Sans } from 'next/font/google'
import '@/styles/styles.scss'
import GlobalProvider from './GlobalProvider'
import ClientModals from './ClientModals'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'
import { getSiteConfig } from '@/lib/site'

const instrument = Instrument_Sans({ subsets: ['latin'], preload: false })
const serverTimeLeft: CountdownTimeType = countdownTime();

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig()
  const siteUrl = site.baseUrl.replace(/\/$/, '')

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
          url: '/images/slider/bg-pet1-1.png',
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
      images: ['/images/slider/bg-pet1-1.png'],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const site = getSiteConfig()
  const siteUrl = site.baseUrl.replace(/\/$/, '')
  const sameAs = [site.social.facebook, site.social.instagram, site.social.twitter, site.social.youtube].filter(Boolean)
  return (
    <html lang="es">
      <body className={instrument.className}>
        <GlobalProvider>
          <div id="app-root">
            {children}
          </div>
          <ClientModals serverTimeLeft={serverTimeLeft} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: site.name,
                url: siteUrl,
                logo: `${siteUrl}${site.logo.src}`,
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
