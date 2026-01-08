import BlogDetail2Client from './BlogDetail2Client'
import { Suspense } from 'react'

export default function BlogDetail2() {
    return (
        <Suspense fallback={null}>
            <BlogDetail2Client />
        </Suspense>
    )
}
