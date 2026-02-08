/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
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
}

module.exports = nextConfig
