import { Metadata } from 'next'

type PageMeta = {
  title: string
  description: string
  images?: string[]
}

export const pageMetadata: Record<string, PageMeta> = {
  about: {
    title: 'Quienes somos',
    description:
      'AutorepuestosCore: equipo tecnico, repuestos confiables y atencion especializada para tu vehiculo.',
  },
  'about copy': {
    title: 'Quienes somos',
    description:
      'AutorepuestosCore: equipo tecnico, repuestos confiables y atencion especializada para tu vehiculo.',
  },
  'coming-soon': {
    title: 'Nuevos lanzamientos',
    description: 'Pronto nuevas lineas de repuestos y accesorios automotrices.',
  },
  contact: {
    title: 'Contacto y cotizaciones',
    description: 'Escribenos para cotizar repuestos, soporte tecnico y pedidos especiales.',
  },
  'customer-feedbacks': {
    title: 'Opiniones',
    description: 'Experiencias reales de clientes que compran en AutorepuestosCore.',
  },
  faqs: {
    title: 'Ayuda y FAQs',
    description: 'Resolvemos dudas sobre compras, entregas, devoluciones y garantias.',
  },
  'page-not-found': {
    title: 'Pagina no encontrada',
    description: 'No encontramos esta pagina. Revisa el enlace o vuelve al inicio.',
  },
  'politica-de-privacidad': {
    title: 'Politica de privacidad',
    description: 'Protegemos tu informacion y datos personales en AutorepuestosCore.',
  },
  'preguntas-frecuentes': {
    title: 'Preguntas frecuentes',
    description: 'Resolvemos dudas sobre compras, entregas, devoluciones y garantias.',
  },
  'store-list': {
    title: 'Puntos de entrega',
    description: 'Conoce nuestros puntos de entrega y aliados logísticos.',
  },
  'terminos-y-condiciones': {
    title: 'Terminos y condiciones',
    description: 'Terminos y condiciones de compra en AutorepuestosCore.',
  },
}

export const buildPageMetadata = (pageKey: string, tenantName: string): Metadata => {
  const meta = pageMetadata[pageKey] ?? {
    title: 'Informacion',
    description: 'Informacion general.',
  }
  return {
    title: `${meta.title} | ${tenantName}`,
    description: meta.description,
    openGraph: meta.images
      ? {
          title: `${meta.title} | ${tenantName}`,
          description: meta.description,
          images: meta.images,
        }
      : undefined,
  }
}
