'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ProductType } from '@/type/ProductType'

const FeatureProduct = dynamic(() => import('./FeatureProduct'), {
    ssr: false,
    loading: () => <FeatureProductPlaceholder />,
})

interface Props {
    data: Array<ProductType>
    start: number
    limit: number
}

const FeatureProductPlaceholder = () => (
    <section className="what-new-block md:pt-20 pt-10" aria-busy="true">
        <div className="container">
            <div className="heading flex flex-col items-center text-center">
                <div className="heading3">Novedades</div>
            </div>
            <div className="list-product grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-[260px] rounded-2xl border border-line bg-surface"
                    />
                ))}
            </div>
        </div>
    </section>
)

export default function DeferredFeatureProduct(props: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [shouldLoad, setShouldLoad] = useState(false)

    useEffect(() => {
        const target = containerRef.current
        if (!target || shouldLoad) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '700px 0px' },
        )

        observer.observe(target)

        return () => observer.disconnect()
    }, [shouldLoad])

    return (
        <div ref={containerRef}>
            {shouldLoad ? <FeatureProduct {...props} /> : <FeatureProductPlaceholder />}
        </div>
    )
}
