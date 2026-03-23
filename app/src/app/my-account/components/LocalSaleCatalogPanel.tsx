'use client'

import React from 'react'
import Image from '@/components/Common/AppImage'

type LocalSaleCatalogPanelProps = {
    products: any[];
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    localSaleUnits: number;
    itemQuantityById: Map<string, number>;
    onAddProduct: (product: any) => void;
    formatMoney: (value: any) => string;
    formatIsoDate: (value?: string | null) => string;
}

export default React.memo(function LocalSaleCatalogPanel({
    products,
    search,
    setSearch,
    localSaleUnits,
    itemQuantityById,
    onAddProduct,
    formatMoney,
    formatIsoDate,
}: LocalSaleCatalogPanelProps) {
    const inventoryUnits = React.useMemo(
        () => products.reduce((acc, item) => acc + Number(item.stock || 0), 0),
        [products]
    )

    return (
        <div className="2xl:col-span-6 border border-line rounded-2xl bg-white p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-lg border border-line bg-surface">
                    <div className="text-[10px] uppercase font-bold text-secondary">Productos disponibles</div>
                    <div className="text-lg font-bold">{products.length}</div>
                </div>
                <div className="p-3 rounded-lg border border-line bg-surface">
                    <div className="text-[10px] uppercase font-bold text-secondary">Unidades en inventario</div>
                    <div className="text-lg font-bold">{inventoryUnits}</div>
                </div>
                <div className="p-3 rounded-lg border border-line bg-surface">
                    <div className="text-[10px] uppercase font-bold text-secondary">Unidades en la venta</div>
                    <div className="text-lg font-bold">{localSaleUnits}</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                <label className="flex-1">
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Buscar artículo</div>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nombre, categoría, SKU o ID"
                        className="w-full px-3 py-2 rounded-lg border border-line bg-white text-black text-sm focus:border-black outline-none"
                    />
                </label>
                <div className="text-xs text-secondary">
                    {products.length} resultado{products.length === 1 ? '' : 's'}
                </div>
            </div>

            <div className="overflow-y-auto overflow-x-hidden max-h-[560px] border border-line rounded-xl">
                <table className="w-full table-fixed">
                    <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
                        <tr>
                            <th className="px-3 py-2 text-left w-[46%]">Producto</th>
                            <th className="px-3 py-2 text-left w-[18%] hidden xl:table-cell">Categoría</th>
                            <th className="px-3 py-2 text-right w-[10%]">Existencia</th>
                            <th className="px-3 py-2 text-right w-[10%]">Costo</th>
                            <th className="px-3 py-2 text-right w-[10%]">Precio</th>
                            <th className="px-3 py-2 text-right w-[14%]">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {products.map((product) => {
                            const cartQty = itemQuantityById.get(product.internalId) ?? 0
                            const noStock = product.stock <= 0
                            const expired = Boolean(product.isExpired)
                            const missingFields: string[] = []

                            if (!product.sku) missingFields.push('SKU')
                            if (!product.category || product.category.toLowerCase().includes('sin categoría')) missingFields.push('categoría')
                            if (product.cost <= 0) missingFields.push('costo')

                            return (
                                <tr key={product.internalId} className="hover:bg-surface/40">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={product.image}
                                                width={44}
                                                height={44}
                                                alt={product.name}
                                                unoptimized={product.image.startsWith('/uploads/') || product.image.startsWith('/images/')}
                                                className="w-11 h-11 rounded-md object-cover border border-line"
                                            />
                                            <div className="min-w-0">
                                                <div className="font-semibold text-sm leading-tight truncate" title={product.name}>{product.name}</div>
                                                <div className="text-[11px] text-secondary">{product.sku ? `SKU: ${product.sku}` : `ID: ${product.legacyId}`}</div>
                                                {missingFields.length > 0 && (
                                                    <div className="text-[10px] text-yellow mt-0.5 truncate" title={`Falta: ${missingFields.join(', ')}`}>
                                                        Falta: {missingFields.join(', ')}
                                                    </div>
                                                )}
                                                {expired && (
                                                    <div className="text-[10px] text-red mt-0.5">
                                                        Vencido{product.expirationDate ? ` (${formatIsoDate(product.expirationDate)})` : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-sm hidden xl:table-cell truncate" title={product.category}>{product.category}</td>
                                    <td className={`px-3 py-2 text-sm text-right font-semibold ${(noStock || expired) ? 'text-red' : ''}`}>
                                        {product.stock}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-right">{formatMoney(product.cost)}</td>
                                    <td className="px-3 py-2 text-sm text-right font-semibold">{formatMoney(product.price)}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onAddProduct(product)}
                                            disabled={noStock || expired || cartQty >= product.stock}
                                            className={`px-2.5 py-1.5 rounded-md text-xs font-bold border transition-all whitespace-nowrap ${(noStock || expired || cartQty >= product.stock)
                                                ? 'border-line text-secondary bg-surface cursor-not-allowed'
                                                : 'border-black text-black hover:bg-black hover:text-white'
                                                }`}
                                        >
                                            {expired ? 'Vencido' : (noStock ? 'Sin stock' : (cartQty > 0 ? `Agregar (${cartQty})` : 'Agregar'))}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-sm text-secondary">
                                    No se encontraron artículos para la búsqueda actual.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
})
