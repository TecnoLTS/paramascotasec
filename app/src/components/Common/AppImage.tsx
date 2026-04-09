import NextImage, { type ImageProps } from 'next/image'
import { versionLocalImagePath } from '@/lib/staticAsset'

const isDevelopment = process.env.NODE_ENV !== 'production'

const shouldBypassOptimizerInDevelopment = (src: string) => {
  if (!isDevelopment) return false

  return (
    src.startsWith('/images/') ||
    src.startsWith('/uploads/') ||
    src.startsWith('http://localhost:8080/') ||
    src.startsWith('https://paramascotasec.com/uploads/') ||
    src.startsWith('https://www.paramascotasec.com/uploads/')
  )
}

const AppImage = (props: ImageProps) => {
  const resolvedSrc = typeof props.src === 'string' ? versionLocalImagePath(props.src) : props.src
  const explicitUnoptimized = props.unoptimized === true
  const developmentUnoptimized =
    typeof resolvedSrc === 'string' && shouldBypassOptimizerInDevelopment(resolvedSrc)

  return (
    <NextImage
      {...props}
      src={resolvedSrc}
      unoptimized={explicitUnoptimized || developmentUnoptimized}
    />
  )
}

export default AppImage
export type { ImageProps }
