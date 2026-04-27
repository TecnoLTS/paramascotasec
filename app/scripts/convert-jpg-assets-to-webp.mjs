import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const appDir = path.resolve(process.cwd())
const roots = [
  path.join(appDir, 'public', 'images'),
  path.join(appDir, 'public', 'uploads'),
]

const jpgPattern = /\.(jpe?g)$/i

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(absolutePath)
    if (!entry.isFile() || !jpgPattern.test(entry.name)) return []
    return [absolutePath]
  }))

  return nested.flat()
}

const webpPathFor = (filePath) => filePath.replace(jpgPattern, '.webp')

const convert = async (filePath) => {
  const outputPath = webpPathFor(filePath)
  await sharp(filePath)
    .rotate()
    .webp({ quality: 82, effort: 5 })
    .toFile(outputPath)
  return outputPath
}

const main = async () => {
  const files = (await Promise.all(roots.map(walk))).flat()

  for (const filePath of files) {
    await convert(filePath)
  }

  process.stdout.write(`Converted ${files.length} JPG/JPEG assets to WebP.\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
