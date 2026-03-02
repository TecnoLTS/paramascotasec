/** @type {import('next').NextConfig} */
const isDevelopment = (process.env.APP_ENV || process.env.NODE_ENV) === 'development'

const nextConfig = {
    reactStrictMode: true,
    images: {
        minimumCacheTTL: 0,
        unoptimized: isDevelopment,
        qualities: [75, 85],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
            },
            {
                protocol: 'https',
                hostname: 'api.paramascotasec.com',
            },
            {
                protocol: 'https',
                hostname: 'paramascotasec.com',
            },
            {
                protocol: 'https',
                hostname: 'www.paramascotasec.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=604800, stale-while-revalidate=86400',
                    },
                ],
            },
            {
                source: '/_next/image',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=3600',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
