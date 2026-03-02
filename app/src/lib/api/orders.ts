import { fetchJson } from '@/lib/apiClient';
import { apiEndpoints } from './endpoints';

export interface CreateOrderData {
    id?: string;
    total: number;
    status?: string;
    shipping_address?: any;
    billing_address?: any;
    items: Array<{
        product_id: string;
        product_name: string;
        product_image?: string;
        quantity: number;
        price: number;
    }>;
}

export const createOrder = async (data: any) => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return fetchJson<any>(apiEndpoints.orders, {
        method: 'POST',
        headers: {
            ...headers
        },
        body: JSON.stringify(data)
    });
};

export const getQuote = async (data: { items: any[], delivery_method: string, coupon_code?: string | null, discount_code?: string | null }) => {
    const res = await fetch('/quote', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
        const code = body?.error?.code || body?.code || ''
        const message =
            body?.error?.message
            || body?.message
            || `Error ${res.status} al calcular la cotización`

        if (code === 'STORE_SALES_DISABLED') {
            return {
                subtotal: 0,
                shipping: 0,
                total: 0,
                vat_rate: 0,
                vat_subtotal: 0,
                vat_amount: 0,
                discount_total: 0,
                storeDisabled: true,
                message
            }
        }

        throw new Error(message)
    }

    return body
};
