import { promises as fs } from 'node:fs'
import path from 'node:path'

const appDir = path.resolve(process.cwd())
const publicImagesDir = path.join(appDir, 'public', 'images')
const outputDir = path.join(appDir, 'src', 'generated')
const outputFile = path.join(outputDir, 'imageVersionManifest.json')

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return walk(absolutePath)
      }

      if (!entry.isFile()) {
        return []
      }

      return [absolutePath]
    })
  )

  return files.flat()
}

const toVersionToken = (stats) => {
  const modified = Math.floor(stats.mtimeMs).toString(36)
  const size = stats.size.toString(36)
  return `${modified}-${size}`
}

const buildManifest = async () => {
  const manifest = {}
  const files = await walk(publicImagesDir)

  for (const absolutePath of files) {
    const relativeFromImages = path.relative(publicImagesDir, absolutePath).split(path.sep).join('/')
    const publicPath = `/images/${relativeFromImages}`
    const stats = await fs.stat(absolutePath)
    manifest[publicPath] = toVersionToken(stats)
  }

  return Object.fromEntries(
    Object.entries(manifest).sort(([left], [right]) => left.localeCompare(right))
  )
}

const main = async () => {
  const manifest = await buildManifest()
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  process.stdout.write(`Manifest generado: ${outputFile} (${Object.keys(manifest).length} archivos)\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
