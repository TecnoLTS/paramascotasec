import {
  PET_CATEGORY_FILTERS,
  PET_CATEGORY_ROUTES,
  PET_FOOTER_CATEGORY_IDS,
  PET_HOME_CATEGORY_CARDS,
  type PetCategoryCard,
  type PetCategoryFilter,
} from '@/data/petCategoryCards'

export type SiteId = 'paramascotasec'

export type CategoryFilter = PetCategoryFilter
export type CategoryCard = PetCategoryCard

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

export type SiteConfig = {
  id: SiteId
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

export const defaultSiteId: SiteId = 'paramascotasec'

// Punto principal para editar datos globales del sitio.
// Si quieres tocar logo, textos, menu, contacto o enlaces, empieza aqui.
export const siteConfig: SiteConfig = {
  id: 'paramascotasec',
  name: 'ParaMascotasEC',
  shortName: 'ParaMascotasEC',
  domain: 'paramascotasec.com',
  baseUrl: 'https://paramascotasec.com',
  apiBaseUrl: 'https://api.paramascotasec.com',
  description:
    'Tienda online para mascotas: alimentos, ropa, juguetes, accesorios y cuidado para perros y gatos.',
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
  categories: PET_HOME_CATEGORY_CARDS,
  categoryFilters: PET_CATEGORY_FILTERS,
  categoryRoutes: PET_CATEGORY_ROUTES,
  menu: {
    categorySections: [
      {
        title: 'Categorías',
        links: [
          { id: 'todos', labelOverride: 'Todas' },
          { id: 'ropa' },
          { id: 'alimento' },
          { id: 'salud' },
          { id: 'accesorios' },
        ],
      },
      {
        title: 'Por mascota',
        links: [
          { id: 'perros' },
          { id: 'gatos' },
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
      { label: 'Ropa para mascotas', href: '/shop/breadcrumb1?category=ropa' },
      { label: 'Alimento para mascotas', href: '/shop/breadcrumb1?category=alimento' },
      { label: 'Salud', href: '/shop/breadcrumb1?category=salud' },
      { label: 'Accesorios', href: '/shop/breadcrumb1?category=accesorios' },
    ],
  },
  footerCategoryLinks: PET_FOOTER_CATEGORY_IDS,
}
