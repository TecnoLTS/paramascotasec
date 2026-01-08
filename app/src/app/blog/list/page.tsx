import BlogListClient from './BlogListClient'
import { Suspense } from 'react'

export default function BlogList() {
    return (
        <Suspense fallback={null}>
            <BlogListClient />
        </Suspense>
    )
}
