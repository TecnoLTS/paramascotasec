import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Instrument_Sans } from 'next/font/google'
import '@/styles/styles.scss'
import GlobalProvider from './GlobalProvider'
import ClientModals from './ClientModals'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'
import { getTenantConfigFromHost, getTenantIdFromHost } from '@/lib/tenant'
import { getHostFromHeaders } from '@/lib/headerUtils'

const instrument = Instrument_Sans({ subsets: ['latin'], preload: false })
const serverTimeLeft: CountdownTimeType = countdownTime();

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers()
  const host = getHostFromHeaders(headerList)
  const tenant = getTenantConfigFromHost(host)
  const siteUrl = tenant.baseUrl.replace(/\/$/, '')

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: tenant.name,
      template: `%s | ${tenant.name}`,
    },
    description: tenant.description,
    applicationName: tenant.name,
    openGraph: {
      title: tenant.name,
      description: tenant.description,
      url: siteUrl,
      siteName: tenant.name,
      locale: 'es_ES',
      type: 'website',
      images: [
        {
          url: '/images/slider/bg-pet1-1.png',
          width: 1200,
          height: 630,
          alt: `${tenant.name} - Ecommerce`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tenant.name,
      description: tenant.description,
      images: ['/images/slider/bg-pet1-1.png'],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const host = getHostFromHeaders(headerList)
  const tenant = getTenantConfigFromHost(host)
  const tenantId = getTenantIdFromHost(host)
  const siteUrl = tenant.baseUrl.replace(/\/$/, '')
  const sameAs = [tenant.social.facebook, tenant.social.instagram, tenant.social.twitter, tenant.social.youtube].filter(Boolean)
  return (
    <html lang="es">
      <body className={instrument.className}>
        <GlobalProvider tenantId={tenantId}>
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
                name: tenant.name,
                url: siteUrl,
                logo: `${siteUrl}${tenant.logo.src}`,
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: tenant.contact.whatsappLabel,
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
