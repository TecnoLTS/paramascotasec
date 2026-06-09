import NextImage, { type ImageProps } from 'next/image'
import { versionLocalImagePath } from '@/lib/staticAsset'
import { isPublicUploadUrl } from '@/lib/publicUploads'

const isDevelopment = process.env.NODE_ENV !== 'production'

const shouldAlwaysBypassOptimizer = (src: string) => isPublicUploadUrl(src)

const shouldBypassOptimizerInDevelopment = (src: string) => {
  if (!isDevelopment) return false

  return (
    src.startsWith('/images/') ||
    src.startsWith('http://localhost:8080/')
  )
}

const AppImage = (props: ImageProps) => {
  const resolvedSrc = typeof props.src === 'string' ? versionLocalImagePath(props.src) : props.src
  const explicitUnoptimized = props.unoptimized === true
  const uploadsUnoptimized =
    typeof resolvedSrc === 'string' && shouldAlwaysBypassOptimizer(resolvedSrc)
  const developmentUnoptimized =
    typeof resolvedSrc === 'string' && shouldBypassOptimizerInDevelopment(resolvedSrc)

  return (
    <NextImage
      {...props}
      src={resolvedSrc}
      unoptimized={explicitUnoptimized || uploadsUnoptimized || developmentUnoptimized}
    />
  )
}

export default AppImage
export type { ImageProps }
