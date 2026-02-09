import { headers } from 'next/headers'
import { getTenantConfigFromHost } from '@/lib/tenant'
import { getHostFromHeaders } from '@/lib/headerUtils'
import { buildPageMetadata as buildParamascotasecMeta } from '@/tenants/paramascotasec.com/pages/meta'
import { buildPageMetadata as buildAutorepuestosMeta } from '@/tenants/autorepuestoscore.com/pages/meta'
import ParamascotasecPage from '@/tenants/paramascotasec.com/pages/preguntas-frecuentes/page'
import AutorepuestosPage from '@/tenants/autorepuestoscore.com/pages/preguntas-frecuentes/page'

const PAGE_KEY = 'preguntas-frecuentes'

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
