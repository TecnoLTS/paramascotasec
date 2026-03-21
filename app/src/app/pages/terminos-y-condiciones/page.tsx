import { getSiteConfig } from '@/lib/site'
import { buildPageMetadata as buildParamascotasecMeta } from '@/tenants/paramascotasec.com/pages/meta'
import ParamascotasecPage from '@/tenants/paramascotasec.com/pages/terminos-y-condiciones/page'

const PAGE_KEY = 'terminos-y-condiciones'

export async function generateMetadata() {
  const site = getSiteConfig()
  return buildParamascotasecMeta(PAGE_KEY, site.name)
}

export default async function Page() {
  return <ParamascotasecPage />
}
