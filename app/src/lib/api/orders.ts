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
    return fetchJson<any>(apiEndpoints.orders, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const getQuote = async (data: { items: any[], delivery_method: string }) => {
    return fetchJson<any>(`${apiEndpoints.orders}/quote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};
