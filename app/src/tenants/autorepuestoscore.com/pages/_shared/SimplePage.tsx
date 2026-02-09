import React from 'react'
import MenuPet from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'

const SimplePage = ({ title, description }: { title: string; description: string }) => {
  return (
    <>
      <div id="header" className="relative w-full style-pet">
        <MenuPet />
      </div>
      <main className="container py-16">
        <div className="max-w-3xl">
          <div className="caption1 uppercase tracking-[0.25em] text-secondary mb-3">
            AutorepuestosCore
          </div>
          <h1 className="heading3 mb-4">{title}</h1>
          <p className="body1 text-secondary">{description}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default SimplePage
