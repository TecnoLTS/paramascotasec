import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Conócenos - Para Mascotas',
    description: 'Descubre nuestra historia, quiénes somos y nuestra pasión por el cuidado de tus mascotas en Para Mascotas Ecuador.',
    openGraph: {
        title: 'Conócenos - Para Mascotas',
        description: 'Descubre nuestra historia, quiénes somos y nuestra pasión por el cuidado de tus mascotas en Para Mascotas Ecuador.',
        images: ['/images/banner/about-banner-1920.jpg'],
    },
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
