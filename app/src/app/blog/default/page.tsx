import BlogDefaultClient from './BlogDefaultClient'
import { Suspense } from 'react'

export default function BlogDefault() {
    return (
        <Suspense fallback={null}>
            <BlogDefaultClient />
        </Suspense>
    )
}
