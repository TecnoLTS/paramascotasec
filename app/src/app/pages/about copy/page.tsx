import { headers } from 'next/headers'
import { getTenantConfigFromHost } from '@/lib/tenant'
import { getHostFromHeaders } from '@/lib/headerUtils'
import { buildPageMetadata as buildParamascotasecMeta } from '@/tenants/paramascotasec.com/pages/meta'
import { buildPageMetadata as buildAutorepuestosMeta } from '@/tenants/autorepuestoscore.com/pages/meta'
import ParamascotasecPage from '@/tenants/paramascotasec.com/pages/about copy/page'
import AutorepuestosPage from '@/tenants/autorepuestoscore.com/pages/about copy/page'

const PAGE_KEY = 'about copy'

export async function generateMetadata() {
  const headerList = await headers()
  const host = getHostFromHeaders(headerList)
  const tenant = getTenantConfigFromHost(host)
  return tenant.id === 'autorepuestoscore'
    ? buildAutorepuestosMeta(PAGE_KEY, tenant.name)
    : buildParamascotasecMeta(PAGE_KEY, tenant.name)
}

export default async function Page() {
  const headerList = await headers()
  const host = getHostFromHeaders(headerList)
  const tenant = getTenantConfigFromHost(host)
  if (tenant.id === 'autorepuestoscore') {
    return <AutorepuestosPage />
  }
  return <ParamascotasecPage />
}
