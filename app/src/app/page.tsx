import React from 'react'
import { getCategoryCards } from '@/data/petCategoryCards'
import { fetchProducts } from '@/lib/products'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTenantConfigFromHost } from '@/lib/tenant'
import { getHostFromHeaders } from '@/lib/headerUtils'
import ParamascotasecHome from '@/tenants/paramascotasec.com/Home'
import AutorepuestosCoreHome from '@/tenants/autorepuestoscore.com/Home'

export async function generateMetadata(): Promise<Metadata> {
    const headerList = await headers()
    const host = getHostFromHeaders(headerList)
    const tenant = getTenantConfigFromHost(host)

    if (tenant.id === 'autorepuestoscore') {
        return {
            title: 'AutorepuestosCore - Repuestos y Accesorios Automotrices',
            description: 'Compra repuestos, lubricantes y accesorios automotrices con entrega rapida en Ecuador.',
            keywords: ['autorepuestos', 'repuestos', 'frenos', 'motor', 'suspension', 'electricos', 'Ecuador'],
        }
    }

    return {
        title: 'ParaMascotasEC - Tu Tienda de Mascotas en Ecuador',
        description: 'Encuentra el mejor alimento, accesorios y cuidados para tus perros y gatos. Calidad premium con entrega en todo Ecuador.',
        keywords: ['mascotas', 'perros', 'gatos', 'alimento para mascotas', 'Ecuador', 'tienda de mascotas online'],
    }
}

export const dynamic = 'force-dynamic'

export default async function HomePet() {
    const headerList = await headers()
    const host = getHostFromHeaders(headerList)
    const tenant = getTenantConfigFromHost(host)
    let products = [] as Awaited<ReturnType<typeof fetchProducts>>
    try {
        products = await fetchProducts()
    } catch (error) {
        console.error('No se pudieron cargar productos en HomePet:', error)
    }
    const categories = getCategoryCards(tenant.id)
    if (tenant.id === 'autorepuestoscore') {
        return <AutorepuestosCoreHome products={products} categories={categories} tenant={tenant} />
    }

    return <ParamascotasecHome products={products} categories={categories} />
}
