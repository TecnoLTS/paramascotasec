import { getSiteConfig } from '@/lib/site'
import { buildPageMetadata as buildParamascotasecMeta } from '@/tenants/paramascotasec.com/pages/meta'
import ParamascotasecPage from '@/tenants/paramascotasec.com/pages/page-not-found/page'

const PAGE_KEY = 'page-not-found'

export async function generateMetadata() {
  const site = getSiteConfig()
  return buildParamascotasecMeta(PAGE_KEY, site.name)
}

export default async function Page() {
  return <ParamascotasecPage />
}
