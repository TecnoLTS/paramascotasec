import NextImage, { type ImageProps } from 'next/image'
import { versionLocalImagePath } from '@/lib/staticAsset'

const AppImage = (props: ImageProps) => {
  const resolvedSrc = typeof props.src === 'string' ? versionLocalImagePath(props.src) : props.src
  return <NextImage {...props} src={resolvedSrc} />
}

export default AppImage
export type { ImageProps }
