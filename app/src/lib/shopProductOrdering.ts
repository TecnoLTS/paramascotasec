import { getCategoryFilter, matchesPetCategoryFilter } from '@/data/petCategoryCards'
import { ProductType } from '@/type/ProductType'

const alimentoFilter = getCategoryFilter('alimento')

const foodFirstRank = (product: ProductType) =>
  matchesPetCategoryFilter(product, alimentoFilter) ? 0 : 1

export const orderProductsFoodFirst = (products: ProductType[]) =>
  products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const rankDiff = foodFirstRank(left.product) - foodFirstRank(right.product)
      return rankDiff || left.index - right.index
    })
    .map(({ product }) => product)
