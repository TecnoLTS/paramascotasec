/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const existingCount = await prisma.product.count()
  if (existingCount > 0) {
    console.log(`Seed omitido: ya existen ${existingCount} productos.`)
    return
  }

  console.log('Seed omitido: no hay fuente de datos para productos.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
