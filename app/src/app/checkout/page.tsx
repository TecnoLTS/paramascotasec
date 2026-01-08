import CheckoutClient from './CheckoutClient'
import { Suspense } from 'react'

export default function Checkout() {
    return (
        <Suspense fallback={null}>
            <CheckoutClient />
        </Suspense>
    )
}
