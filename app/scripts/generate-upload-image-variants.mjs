import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const appDir = path.resolve(process.cwd())
const uploadProductsDir = path.join(appDir, 'public', 'uploads', 'products')
const variantWidths = [220, 360]
const variantPattern = /-\d+\.webp$/i

const pathExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const walk = async (directory) => {
  if (!(await pathExists(directory))) return []

  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(absolutePath)
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.webp')) return []
    if (variantPattern.test(entry.name)) return []
    return [absolutePath]
  }))

  return nested.flat()
}

const variantPathFor = (filePath, width) => filePath.replace(/\.webp$/i, `-${width}.webp`)

const generateVariant = async (filePath, width) => {
  const outputPath = variantPathFor(filePath, width)
  await sharp(filePath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(outputPath)
  return outputPath
}

const main = async () => {
  const files = await walk(uploadProductsDir)
  let generated = 0

  for (const filePath of files) {
    for (const width of variantWidths) {
      await generateVariant(filePath, width)
      generated += 1
    }
  }

  process.stdout.write(`Generated ${generated} upload image variants from ${files.length} source images.\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
