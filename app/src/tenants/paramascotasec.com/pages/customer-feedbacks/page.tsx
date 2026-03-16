import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer'

const CustomerFeedbacks = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Customer Feedbacks' subHeading='Customer Feedbacks' />
            </div>
            <div className='customer-feedbacks md:py-20 py-10'>
                <div className="container">
                    <div className="max-w-3xl mx-auto rounded-3xl border border-line bg-surface p-8 md:p-12 text-center">
                        <div className="heading4">Aun no hay resenas verificadas publicadas</div>
                        <p className="text-secondary mt-4 leading-7">
                            Cuando existan comentarios reales de clientes, se mostraran aqui. Preferimos no publicar opiniones simuladas.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CustomerFeedbacks
