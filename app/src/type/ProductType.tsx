interface Variation {
    color: string;
    colorCode: string;
    colorImage: string;
    image: string;
}

export interface ProductType {
    id: string,
    internalId?: string,
    category: string,
    productType?: string,
    cost?: number,
    business?: {
        cost?: number,
        margin?: number,
        profit?: number,
        suggestions?: {
            min_price?: number,
            recommended_price?: number,
            max_price?: number,
            min_price_pvp?: number,
            recommended_price_pvp?: number,
            max_price_pvp?: number
        }
    },
    attributes?: Record<string, string>,
    expirationDate?: string | null,
    expirationAlertDays?: number,
    daysToExpire?: number | null,
    expirationStatus?: 'none' | 'ok' | 'expiring' | 'expired',
    pageSettings?: {
        deliveryEstimate: string,
        viewerCount: number,
        freeShippingThreshold: number,
        supportHours: string,
        returnDays: number
    },
    type: string,
    name: string,
    gender: string,
    new: boolean,
    sale: boolean,
    rate: number,
    price: number,
    originPrice: number,
    brand: string,
    sold: number,
    quantity: number,
    quantityPurchase: number,
    sizes: Array<string>,
    variation: Variation[],
    thumbImage: Array<string>,
    images: Array<string>,
    imageMeta?: Array<{
        url: string;
        width?: number;
        height?: number;
        kind?: string;
    }>,
    description: string,
    action: string,
    slug: string
}
