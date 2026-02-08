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

export const getQuote = async (data: { items: any[], delivery_method: string }) => {
    return fetchJson<any>('/quote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};
