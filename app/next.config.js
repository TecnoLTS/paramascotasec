/** @type {import('next').NextConfig} */
const imageOptimizationDisabled = process.env.NEXT_IMAGE_UNOPTIMIZED === '1'
const allowedDevOrigins = [
    'paramascotasec.com',
    'www.paramascotasec.com',
    '192.168.100.229',
    'localhost',
    '127.0.0.1',
]

const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins,
    images: {
        minimumCacheTTL: 0,
        unoptimized: imageOptimizationDisabled,
        qualities: [75, 85, 90],
        formats: ['image/avif', 'image/webp'],
        localPatterns: [
            {
                pathname: '/**',
            },
        ],
        deviceSizes: [360, 420, 576, 640, 750, 768, 828, 992, 1080, 1200, 1320, 1536, 1920, 2048, 2560, 3840],
        imageSizes: [96, 128, 150, 180, 202, 220, 256, 300, 360, 420, 472, 496, 520, 630, 750, 960, 1200, 1600, 2000],
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
        if (process.env.NODE_ENV !== 'production') {
            return []
        }

        return [
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
