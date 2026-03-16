export type TenantId = 'paramascotasec' | 'autorepuestoscore'

export type CategoryFilter = {
  category?: string
  gender?: string
}

export type CategoryCard = {
  id: string
  label: string
  image: string
}

export type CategoryLink = {
  id: string
  gender?: string
  labelOverride?: string
}

export type MenuLink = {
  label: string
  href: string
}

export type MenuSection = {
  title: string
  links: CategoryLink[]
}

export type TenantConfig = {
  id: TenantId
  name: string
  shortName: string
  domain: string
  baseUrl: string
  apiBaseUrl: string
  description: string
  logo: {
    src: string
    alt: string
    mobileSrc?: string
  }
  contact: {
    email: string
    whatsappNumber: string
    whatsappLabel: string
  }
  social: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  hero?: {
    eyebrow: string
    title: string
    subtitle: string
    primaryCta: { label: string; href: string }
    secondaryCta?: { label: string; href: string }
  }
  categories: CategoryCard[]
  categoryFilters: Record<string, CategoryFilter>
  categoryRoutes: Record<string, string>
  menu: {
    categorySections: MenuSection[]
    serviceLinks: MenuLink[]
    companyLinks: MenuLink[]
    banner: { title: string; subtitle: string; image: string }
    servicesBanner?: { title: string; subtitle: string; image: string }
    departmentLinks?: MenuLink[]
  }
  footerCategoryLinks: string[]
}

export const defaultTenantId: TenantId = 'paramascotasec'

const tenants: Record<TenantId, TenantConfig> = {
  paramascotasec: {
    id: 'paramascotasec',
    name: 'ParaMascotasEC',
    shortName: 'ParaMascotasEC',
    domain: 'paramascotasec.com',
    baseUrl: 'https://paramascotasec.com',
    apiBaseUrl: 'https://api.paramascotasec.com',
    description:
      'Tienda online para mascotas: alimentos, juguetes, accesorios y cuidado para perros y gatos.',
    logo: {
      src: '/images/brand/LogoVerde150.svg',
      alt: 'ParaMascotasEC',
      mobileSrc: '/images/brand/LogoVerde150.png',
    },
    contact: {
      email: 'info@paramascotasec.com',
      whatsappNumber: '593992782126',
      whatsappLabel: '+593 (099) 278-21-xx',
    },
    social: {
      facebook: 'https://www.facebook.com/paramascotasec',
      instagram: 'https://www.instagram.com/paramascotasec',
      twitter: 'https://www.twitter.com/',
      youtube: 'https://www.youtube.com/',
    },
    categories: [
      { id: 'todos', label: 'Todas', image: '/images/collection/categoria_todas.jpg' },
      { id: 'descuentos', label: 'Ofertas', image: '/images/collection/categoria_ofertas.jpg' },
      { id: 'comida para perros', label: 'Comida para perros', image: '/images/collection/categoria_perros.jpg' },
      { id: 'comida para gatos', label: 'Comida para gatos', image: '/images/collection/categoria_gatos.jpg' },
      { id: 'cuidado', label: 'Cuidado', image: '/images/collection/pharmacy.png' },
    ],
    categoryFilters: {
      'comida para perros': { category: 'comida para perros', gender: 'dog' },
      'comida para gatos': { category: 'comida para gatos', gender: 'cat' },
      perros: { gender: 'dog' },
      gatos: { gender: 'cat' },
      cuidado: { category: 'cuidado' },
      descuentos: {},
      todos: {},
    },
    categoryRoutes: {
      todos: '/shop/breadcrumb1',
      descuentos: '/shop/breadcrumb1?category=descuentos',
      perros: '/shop/breadcrumb1?category=perros&gender=dog',
      gatos: '/shop/breadcrumb1?category=gatos&gender=cat',
      juguetes: '/shop/breadcrumb1?category=juguetes',
      'comida para perros': '/shop/breadcrumb1?category=comida%20para%20perros&gender=dog',
      'comida para gatos': '/shop/breadcrumb1?category=comida%20para%20gatos&gender=cat',
      camas: '/shop/breadcrumb1?category=camas',
      accesorios: '/shop/breadcrumb1?category=accesorios',
      comederos: '/shop/breadcrumb1?category=comederos',
      cuidado: '/shop/breadcrumb1?category=cuidado',
    },
    menu: {
      categorySections: [
        {
          title: 'Categorias principales',
          links: [
            { id: 'descuentos' },
            { id: 'comida para perros' },
            { id: 'comida para gatos' },
            { id: 'cuidado' },
            { id: 'todos', labelOverride: 'Todas las categorias' },
          ],
        },
        {
          title: 'Perros',
          links: [
            { id: 'comida para perros' },
            { id: 'cuidado', labelOverride: 'Cuidado y bienestar' },
          ],
        },
        {
          title: 'Gatos',
          links: [
            { id: 'comida para gatos' },
            { id: 'cuidado', labelOverride: 'Cuidado e higiene' },
          ],
        },
      ],
      serviceLinks: [
        { label: 'Envios y devoluciones', href: '/pages/faqs' },
        { label: 'Centro de ayuda', href: '/pages/contact' },
      ],
      companyLinks: [{ label: 'Quienes somos', href: '/pages/about' }],
      banner: {
        title: ' ',
        subtitle: ' ',
        image: '/images/collection/14.jpg',
      },
      servicesBanner: {
        title: ' ',
        subtitle: ' ',
        image: '/images/collection/15.jpg',
      },
      departmentLinks: [
        { label: 'Comida para perros', href: '/shop/breadcrumb1?category=comida%20para%20perros&gender=dog' },
        { label: 'Comida para gatos', href: '/shop/breadcrumb1?category=comida%20para%20gatos&gender=cat' },
        { label: 'Cuidado y bienestar', href: '/shop/breadcrumb1?category=cuidado' },
      ],
    },
    footerCategoryLinks: ['todos', 'descuentos', 'comida para perros', 'comida para gatos', 'cuidado'],
  },
  autorepuestoscore: {
    id: 'autorepuestoscore',
    name: 'AutorepuestosCore',
    shortName: 'AutorepuestosCore',
    domain: 'autorepuestoscore.com',
    baseUrl: 'https://autorepuestoscore.com',
    apiBaseUrl: 'https://api.autorepuestoscore.com',
    description:
      'Repuestos y accesorios automotrices para motor, frenos y suspension. Cotizaciones rapidas y soporte tecnico.',
    logo: {
      src: '/images/brand/LogoVerde150.svg',
      alt: 'AutorepuestosCore',
      mobileSrc: '/images/brand/LogoVerde150.png',
    },
    contact: {
      email: 'info@autorepuestoscore.com',
      whatsappNumber: '593992782126',
      whatsappLabel: '+593 (099) 278-21-xx',
    },
    social: {
      facebook: 'https://www.facebook.com/',
      instagram: 'https://www.instagram.com/',
      twitter: 'https://www.twitter.com/',
      youtube: 'https://www.youtube.com/',
    },
    hero: {
      eyebrow: 'AutorepuestosCore.com',
      title: 'Todo para tu vehiculo en un solo lugar',
      subtitle:
        'Stock real de repuestos, lubricantes y electricos. Cotiza por WhatsApp y recibe asesoria tecnica.',
      primaryCta: { label: 'Explorar catalogo', href: '/shop/breadcrumb1' },
      secondaryCta: { label: 'Pedir cotizacion', href: '/pages/contact' },
    },
    categories: [
      { id: 'todos', label: 'Todos los repuestos', image: '/images/collection/categoria_todas.jpg' },
      { id: 'descuentos', label: 'Ofertas', image: '/images/collection/categoria_ofertas.jpg' },
      { id: 'motor', label: 'Motor', image: '/images/collection/categoria_perros.jpg' },
      { id: 'frenos', label: 'Frenos', image: '/images/collection/categoria_gatos.jpg' },
      { id: 'suspension', label: 'Suspension', image: '/images/collection/categoria_juguetes.jpg' },
      { id: 'electricos', label: 'Electricos', image: '/images/collection/categoria_camas.jpg' },
    ],
    categoryFilters: {
      motor: { category: 'motor' },
      frenos: { category: 'frenos' },
      suspension: { category: 'suspension' },
      electricos: { category: 'electricos' },
      accesorios: { category: 'accesorios' },
      descuentos: {},
      todos: {},
    },
    categoryRoutes: {
      todos: '/shop/breadcrumb1',
      descuentos: '/shop/breadcrumb1?category=descuentos',
      motor: '/shop/breadcrumb1?category=motor',
      frenos: '/shop/breadcrumb1?category=frenos',
      suspension: '/shop/breadcrumb1?category=suspension',
      electricos: '/shop/breadcrumb1?category=electricos',
      accesorios: '/shop/breadcrumb1?category=accesorios',
    },
    menu: {
      categorySections: [
        {
          title: 'Categorias principales',
          links: [
            { id: 'descuentos' },
            { id: 'motor' },
            { id: 'frenos' },
            { id: 'suspension' },
            { id: 'electricos' },
            { id: 'todos', labelOverride: 'Todas las categorias' },
          ],
        },
      ],
      serviceLinks: [
        { label: 'Envios y devoluciones', href: '/pages/faqs' },
        { label: 'Centro de ayuda', href: '/pages/contact' },
      ],
      companyLinks: [{ label: 'Quienes somos', href: '/pages/about' }],
      banner: {
        title: ' ',
        subtitle: ' ',
        image: '/images/collection/14.jpg',
      },
      servicesBanner: {
        title: ' ',
        subtitle: ' ',
        image: '/images/collection/15.jpg',
      },
      departmentLinks: [
        { label: 'Motor', href: '/shop/breadcrumb1?category=motor' },
        { label: 'Frenos', href: '/shop/breadcrumb1?category=frenos' },
        { label: 'Suspension', href: '/shop/breadcrumb1?category=suspension' },
      ],
    },
    footerCategoryLinks: ['todos', 'descuentos', 'motor', 'frenos'],
  },
}

const normalizeHost = (host?: string | null) => {
  if (!host) return ''
  return host.toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/:\d+$/, '').replace(/^www\./, '')
}

export const getTenantIdFromHost = (host?: string | null): TenantId => {
  const normalized = normalizeHost(host)
  if (normalized === 'autorepuestoscore.com') return 'autorepuestoscore'
  if (normalized === 'paramascotasec.com') return 'paramascotasec'
  return defaultTenantId
}

export const getTenantConfig = (tenantId?: TenantId) => tenants[tenantId ?? defaultTenantId]

export const getTenantConfigFromHost = (host?: string | null) =>
  getTenantConfig(getTenantIdFromHost(host))
