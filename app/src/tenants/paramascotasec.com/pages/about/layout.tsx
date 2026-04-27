import type { Metadata } from 'next'
import { versionLocalImagePath } from '@/lib/staticAsset'

export const metadata: Metadata = {
    title: 'Conócenos - Para Mascotas',
    description: 'Descubre nuestra historia, quiénes somos y nuestra pasión por el cuidado de tus mascotas en Para Mascotas Ecuador.',
    openGraph: {
        title: 'Conócenos - Para Mascotas',
        description: 'Descubre nuestra historia, quiénes somos y nuestra pasión por el cuidado de tus mascotas en Para Mascotas Ecuador.',
        images: [versionLocalImagePath('/images/banner/27.webp')],
    },
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
