import React from 'react'
import MenuPet from '@/components/Header/Menu/MenuPet'
import Collection from '@/components/Pet/Collection'
import AllProducts from '@/components/Product/AllProducts'
import Footer from '@/components/Footer/Footer'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import { CategoryCard, TenantConfig } from '@/lib/tenant'
import { ProductType } from '@/type/ProductType'

const AutorepuestosCoreHome = ({
  products,
  categories,
  tenant,
}: {
  products: ProductType[]
  categories: CategoryCard[]
  tenant: TenantConfig
}) => {
  return (
    <>
      <ScrollToTopOnMount />
      <div id="header" className="relative w-full style-pet">
        <MenuPet />
      </div>
      {tenant.hero && (
        <section className="bg-surface py-12">
          <div className="container">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-8 md:p-12">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">{tenant.hero.eyebrow}</p>
              <h1 className="heading2 mt-4">{tenant.hero.title}</h1>
              <p className="body1 mt-4 max-w-2xl text-white/80">{tenant.hero.subtitle}</p>
              <div className="mt-3 text-white/60 text-sm">
                Catalogo especializado en repuestos automotrices.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a className="button-main bg-white text-slate-900 hover:bg-white/90" href={tenant.hero.primaryCta.href}>
                  {tenant.hero.primaryCta.label}
                </a>
                {tenant.hero.secondaryCta && (
                  <a className="button-main border border-white/40 text-white hover:bg-white/10" href={tenant.hero.secondaryCta.href}>
                    {tenant.hero.secondaryCta.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      <Collection categories={categories} />
      <AllProducts data={products} />
      <Footer />
    </>
  )
}

export default AutorepuestosCoreHome
