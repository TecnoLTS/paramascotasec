import ApiTestClient from './ApiTestClient'
import { notFound } from 'next/navigation'

export default function ApiTest() {
    if ((process.env.APP_ENV || process.env.NODE_ENV) === 'production') {
        notFound()
    }
    return <ApiTestClient />
}
