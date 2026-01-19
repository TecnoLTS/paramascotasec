import type { Metadata } from 'next'
import { Instrument_Sans } from 'next/font/google'
import '@/styles/styles.scss'
import GlobalProvider from './GlobalProvider'
import ClientModals from './ClientModals'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'

const instrument = Instrument_Sans({ subsets: ['latin'], preload: false })
const serverTimeLeft: CountdownTimeType = countdownTime();

const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ParaMascotasEC',
    template: '%s | ParaMascotasEC',
  },
  description: 'Tienda online para mascotas: alimentos, juguetes, accesorios y cuidado para perros y gatos.',
  applicationName: 'ParaMascotasEC',
  openGraph: {
    title: 'ParaMascotasEC',
    description: 'Tienda online para mascotas: alimentos, juguetes, accesorios y cuidado para perros y gatos.',
    url: siteUrl,
    siteName: 'ParaMascotasEC',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/images/slider/bg-pet1-1.png',
        width: 1200,
        height: 630,
        alt: 'ParaMascotasEC - Tienda online para mascotas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ParaMascotasEC',
    description: 'Tienda online para mascotas: alimentos, juguetes, accesorios y cuidado para perros y gatos.',
    images: ['/images/slider/bg-pet1-1.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={instrument.className}>
        <GlobalProvider>
          {children}
          <ClientModals serverTimeLeft={serverTimeLeft} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'ParaMascotasEC',
                url: siteUrl,
                logo: `${siteUrl}/images/logo.png`,
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+593-XXXXXXXXX', // Should be updated with real info
                  contactType: 'customer service',
                  areaServed: 'EC',
                  availableLanguage: 'Spanish'
                },
                sameAs: [
                  'https://www.facebook.com/paramascotasec',
                  'https://www.instagram.com/paramascotasec',
                ]
              })
            }}
          />
        </GlobalProvider>
      </body>
    </html>
  )
}
