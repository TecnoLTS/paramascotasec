'use client'

// CartContext.tsx
import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { ProductType } from '@/type/ProductType';

interface CartItem extends ProductType {
    quantity: number
    selectedSize: string
    selectedColor: string
}

interface CartState {
    cartArray: CartItem[]
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: ProductType }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | {
        type: 'UPDATE_CART'; payload: {
            itemId: string; quantity: number, selectedSize: string, selectedColor: string
        }
    }
    | { type: 'LOAD_CART'; payload: CartItem[] }

interface CartContextProps {
    cartState: CartState;
    addToCart: (item: ProductType) => void;
    removeFromCart: (itemId: string) => void;
    updateCart: (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART':
            const quantityToAdd = action.payload.quantityPurchase ?? 1;
            const existed = state.cartArray.find(item => item.id === action.payload.id);
            if (existed) {
                return {
                    ...state,
                    cartArray: state.cartArray.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + quantityToAdd }
                            : item
                    ),
                };
            }
            const newItem: CartItem = { ...action.payload, quantity: quantityToAdd, selectedSize: '', selectedColor: '' };
            return {
                ...state,
                cartArray: [...state.cartArray, newItem],
            };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartArray: state.cartArray.filter((item) => item.id !== action.payload),
            };
        case 'UPDATE_CART':
            return {
                ...state,
                cartArray: state.cartArray.map((item) =>
                    item.id === action.payload.itemId
                        ? {
                            ...item,
                            quantity: action.payload.quantity,
                            selectedSize: action.payload.selectedSize,
                            selectedColor: action.payload.selectedColor
                        }
                        : item
                ),
            };
        case 'LOAD_CART':
            return {
                ...state,
                cartArray: action.payload,
            };
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const stored = localStorage.getItem('cart');
            if (stored) {
                const parsed = JSON.parse(stored) as CartItem[];
                dispatch({ type: 'LOAD_CART', payload: parsed });
            }
        } catch (error) {
            console.error('Error al cargar carrito', error);
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(cartState.cartArray));
            }
        } catch (error) {
            console.error('Error al guardar carrito', error);
        }
    }, [cartState.cartArray, hydrated]);

    const addToCart = (item: ProductType) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
    };

    const removeFromCart = (itemId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    };

    const updateCart = (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => {
        dispatch({ type: 'UPDATE_CART', payload: { itemId, quantity, selectedSize, selectedColor } });
    };

    return (
        <CartContext.Provider value={{ cartState, addToCart, removeFromCart, updateCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
