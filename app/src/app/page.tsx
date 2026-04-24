import React from 'react'
import { fetchProducts } from '@/lib/products'
import { Metadata } from 'next'
import { getSiteConfig } from '@/lib/site'
import ParamascotasecHome from '@/tenants/paramascotasec.com/Home'
import { orderProductsFoodFirst } from '@/lib/shopProductOrdering'

export async function generateMetadata(): Promise<Metadata> {
    const site = getSiteConfig()

    return {
        title: `${site.name} - Tu Tienda de Mascotas en Ecuador`,
        description: site.description,
        keywords: ['mascotas', 'perros', 'gatos', 'alimento para mascotas', 'Ecuador', 'tienda de mascotas online'],
    }
}

export const revalidate = 60

export default async function HomePet() {
    let products = [] as Awaited<ReturnType<typeof fetchProducts>>
    try {
        products = orderProductsFoodFirst(await fetchProducts())
    } catch (error) {
        console.error('No se pudieron cargar productos en HomePet:', error)
    }

    return <ParamascotasecHome products={products} />
}
