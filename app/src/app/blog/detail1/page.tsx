import BlogDetail1Client from './BlogDetail1Client'
import { Suspense } from 'react'

export default function BlogDetail1() {
    return (
        <Suspense fallback={null}>
            <BlogDetail1Client />
        </Suspense>
    )
}
