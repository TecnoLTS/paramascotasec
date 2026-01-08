import { randomUUID } from 'crypto'
import { PoolClient } from 'pg'

import { query, withTransaction } from '@/lib/db'
import { mapProductToDto } from '@/lib/productMapper'
import { ProductType } from '@/type/ProductType'

type VariationInput = {
  color?: string
  colorCode?: string | null
  colorImage?: string | null
  image?: string | null
}

type DbVariation = {
  color: string
  colorCode?: string | null
  colorImage?: string | null
  image?: string | null
}

type DbProductRow = {
  id: string
  legacyId: string | null
  category: string
  name: string
  gender: string | null
  new: boolean
  sale: boolean
  price: string | number
  originPrice: string | number
  brand: string | null
  sold: number
  quantity: number
  description: string
  action: string | null
  slug: string
  images: (string | { url: string })[] | null
  variations: DbVariation[] | null
}

export type ProductPayload = Partial<ProductType> & {
  id?: string
  legacyId?: string | null
  images?: string[]
  variations?: VariationInput[]
  variation?: VariationInput[]
  thumbImage?: string[]
}

const PRODUCT_BASE_QUERY = `
SELECT
  p.id,
  p."legacyId",
  p.categoria AS "category",
  p.nombre AS "name",
  p.genero AS "gender",
  p.nuevo AS "new",
  p.oferta AS "sale",
  p.precio AS "price",
  p.precio_original AS "originPrice",
  p.marca AS "brand",
  p.vendido AS "sold",
  p.cantidad AS "quantity",
  p.descripcion AS "description",
  p.accion AS "action",
  p.slug AS "slug",
  COALESCE(img.images, '[]') AS images,
  COALESCE(var.variations, '[]') AS variations
FROM "Product" p
LEFT JOIN LATERAL (
  SELECT json_agg(i.url ORDER BY i.id) AS images
  FROM "Image" i
  WHERE i."productId" = p.id
) img ON true
LEFT JOIN LATERAL (
  SELECT json_agg(jsonb_build_object(
    'color', v.color,
    'colorCode', v."colorCode",
    'colorImage', v."colorImage",
    'image', v.image
  ) ORDER BY v.id) AS variations
  FROM "Variation" v
  WHERE v."productId" = p.id
) var ON true
`

const toDto = (row: DbProductRow): ProductType =>
  mapProductToDto({
    ...row,
    images: row.images ?? [],
    variations: row.variations ?? [],
  })

const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const toIntegerOrNull = (value: unknown) => {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isInteger(num) ? num : null
}

const sanitizeImages = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item && 'url' in item && typeof (item as any).url === 'string') {
        return (item as any).url as string
      }
      return null
    })
    .filter((item): item is string => Boolean(item))
}

const sanitizeVariations = (value: unknown): VariationInput[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => ({
      color: (item as any)?.color ?? '',
      colorCode: (item as any)?.colorCode ?? null,
      colorImage: (item as any)?.colorImage ?? null,
      image: (item as any)?.image ?? null,
    }))
    .filter((v) => v.color)
}

const normalizePayload = (payload: ProductPayload) => {
  const images = sanitizeImages(payload.images ?? payload.thumbImage ?? [])
  const variations = sanitizeVariations(payload.variations ?? payload.variation ?? [])

  return {
    ...payload,
    images,
    variations,
  }
}

const resolveProductId = async (idOrLegacy: string): Promise<string | null> => {
  const { rows } = await query<{ id: string }>(
    'SELECT id FROM "Product" WHERE id = $1 OR "legacyId" = $1 LIMIT 1',
    [idOrLegacy],
  )
  return rows[0]?.id ?? null
}

const fetchProductRowById = async (productId: string): Promise<DbProductRow | null> => {
  const { rows } = await query<DbProductRow>(`${PRODUCT_BASE_QUERY} WHERE p.id = $1`, [productId])
  return rows[0] ?? null
}

const insertImages = async (client: PoolClient, productId: string, images: string[]) => {
  if (!images.length) return
  for (const url of images) {
    await client.query(
      `INSERT INTO "Image" (id, url, "productId") VALUES ($1, $2, $3)`,
      [randomUUID(), url, productId],
    )
  }
}

const insertVariations = async (client: PoolClient, productId: string, variations: VariationInput[]) => {
  if (!variations.length) return
  for (const variation of variations) {
    await client.query(
      `INSERT INTO "Variation" (id, color, "colorCode", "colorImage", image, "productId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), variation.color, variation.colorCode, variation.colorImage, variation.image, productId],
    )
  }
}

const replaceImages = async (client: PoolClient, productId: string, images: string[]) => {
  await client.query(`DELETE FROM "Image" WHERE "productId" = $1`, [productId])
  await insertImages(client, productId, images)
}

const replaceVariations = async (client: PoolClient, productId: string, variations: VariationInput[]) => {
  await client.query(`DELETE FROM "Variation" WHERE "productId" = $1`, [productId])
  await insertVariations(client, productId, variations)
}

export const listProducts = async (): Promise<ProductType[]> => {
  const { rows } = await query<DbProductRow>(`${PRODUCT_BASE_QUERY} ORDER BY p."fecha_de_creacion" DESC`)
  return rows.map(toDto)
}

export const getProduct = async (idOrLegacy: string): Promise<ProductType | null> => {
  const { rows } = await query<DbProductRow>(
    `${PRODUCT_BASE_QUERY} WHERE p.id = $1 OR p."legacyId" = $1 LIMIT 1`,
    [idOrLegacy],
  )
  const row = rows[0]
  return row ? toDto(row) : null
}

export const createProduct = async (payload: ProductPayload): Promise<ProductType> => {
  const normalized = normalizePayload(payload)

  const price = toNumberOrNull(normalized.price)
  const originPrice = toNumberOrNull(normalized.originPrice ?? normalized.price)
  const quantity = normalized.quantity !== undefined ? toIntegerOrNull(normalized.quantity) : 0
  const sold = normalized.sold !== undefined ? toIntegerOrNull(normalized.sold) : 0

  if (!normalized.category || !normalized.name || price === null || originPrice === null || !normalized.description || !normalized.slug) {
    throw new Error('Faltan campos obligatorios para crear el producto')
  }

  const productId = normalized.id ?? randomUUID()

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO "Product" (
        id, "legacyId", categoria, nombre, genero, nuevo, oferta, precio, precio_original, marca,
        vendido, cantidad, descripcion, accion, slug, fecha_de_creacion, fecha_de_actualziacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
      [
        productId,
        normalized.legacyId ?? null,
        normalized.category,
        normalized.name,
        normalized.gender ?? null,
        normalized.new ?? false,
        normalized.sale ?? false,
        price,
        originPrice,
        normalized.brand ?? null,
        sold ?? 0,
        quantity ?? 0,
        normalized.description,
        normalized.action ?? null,
        normalized.slug,
      ],
    )

    await insertImages(client, productId, normalized.images)
    await insertVariations(client, productId, normalized.variations)
  })

  const product = await fetchProductRowById(productId)
  if (!product) {
    throw new Error('No se pudo recuperar el producto recién creado')
  }

  return toDto(product)
}

export const updateProduct = async (idOrLegacy: string, payload: ProductPayload): Promise<ProductType | null> => {
  const productId = await resolveProductId(idOrLegacy)
  if (!productId) return null

  const normalized = normalizePayload(payload)

  const assignments: string[] = []
  const values: any[] = []

  const pushUpdate = (column: string, value: unknown) => {
    if (value === undefined) return
    values.push(value)
    assignments.push(`${column} = $${values.length}`)
  }

  const price = normalized.price === undefined ? undefined : toNumberOrNull(normalized.price)
  const originPrice =
    normalized.originPrice === undefined && normalized.price === undefined
      ? undefined
      : toNumberOrNull(normalized.originPrice ?? normalized.price)
  const quantity = normalized.quantity === undefined ? undefined : toIntegerOrNull(normalized.quantity)
  const sold = normalized.sold === undefined ? undefined : toIntegerOrNull(normalized.sold)

  pushUpdate('categoria', normalized.category)
  pushUpdate('nombre', normalized.name)
  pushUpdate('genero', normalized.gender ?? null)
  if (normalized.new !== undefined) pushUpdate('nuevo', normalized.new)
  if (normalized.sale !== undefined) pushUpdate('oferta', normalized.sale)
  if (price !== undefined) pushUpdate('precio', price)
  if (originPrice !== undefined) pushUpdate('precio_original', originPrice)
  pushUpdate('marca', normalized.brand ?? null)
  if (sold !== undefined) pushUpdate('vendido', sold)
  if (quantity !== undefined) pushUpdate('cantidad', quantity)
  if (normalized.description !== undefined) pushUpdate('descripcion', normalized.description)
  pushUpdate('accion', normalized.action ?? null)
  pushUpdate('slug', normalized.slug)
  pushUpdate('"legacyId"', normalized.legacyId ?? null)

  values.push(productId)
  const setClause =
    assignments.length > 0
      ? `${assignments.join(', ')}, "fecha_de_actualziacion" = NOW()`
      : `"fecha_de_actualziacion" = NOW()`

  await withTransaction(async (client) => {
    await client.query(`UPDATE "Product" SET ${setClause} WHERE id = $${values.length}`, values)

    if (normalized.images !== undefined) {
      await replaceImages(client, productId, normalized.images)
    }

    if (normalized.variations !== undefined) {
      await replaceVariations(client, productId, normalized.variations)
    }
  })

  const product = await fetchProductRowById(productId)
  return product ? toDto(product) : null
}

export const deleteProduct = async (idOrLegacy: string): Promise<boolean> => {
  const productId = await resolveProductId(idOrLegacy)
  if (!productId) return false

  await withTransaction(async (client) => {
    await client.query(`DELETE FROM "Image" WHERE "productId" = $1`, [productId])
    await client.query(`DELETE FROM "Variation" WHERE "productId" = $1`, [productId])
    await client.query(`DELETE FROM "Product" WHERE id = $1`, [productId])
  })

  return true
}
