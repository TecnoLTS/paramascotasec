import imageVersionManifest from '@/generated/imageVersionManifest.json'

const VERSION_SEARCH_PARAM = 'v'

const isVersionedParamPresent = (params: URLSearchParams) => params.has(VERSION_SEARCH_PARAM)

const resolveManifestVersion = (pathname: string) => imageVersionManifest[pathname as keyof typeof imageVersionManifest]

export const versionLocalImagePath = (src: string) => {
  if (!src.startsWith('/images/')) {
    return src
  }

  const [pathname, existingQuery = ''] = src.split('?')
  const version = resolveManifestVersion(pathname)

  if (!version) {
    return src
  }

  const params = new URLSearchParams(existingQuery)
  if (isVersionedParamPresent(params)) {
    return src
  }

  params.set(VERSION_SEARCH_PARAM, version)
  const queryString = params.toString()

  return queryString ? `${pathname}?${queryString}` : pathname
}

export const versionStaticAssetPath = versionLocalImagePath
