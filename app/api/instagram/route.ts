import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Server-side proxy for Instagram oEmbed with simple disk cache and scraping fallback.
// Tries Graph API with token, falls back to legacy oEmbed endpoint, then scrapes og:image.

const CACHE_DIR = path.resolve(process.cwd(), '.cache', 'instagram')
const TTL = Number(process.env.INSTAGRAM_OEMBED_TTL || 60 * 60 * 24) // seconds, default 24h

async function ensureCacheDir() {
  try {
    await fs.promises.mkdir(CACHE_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

function cachePathFor(url: string) {
  const safe = Buffer.from(url).toString('base64').replace(/=/g, '')
  return path.join(CACHE_DIR, `${safe}.json`)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const token = process.env.INSTAGRAM_OEMBED_TOKEN || searchParams.get('token')

    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    await ensureCacheDir()
    const cacheFile = cachePathFor(url)

    // If cache exists and fresh, return it immediately
    try {
      const stat = await fs.promises.stat(cacheFile)
      const age = (Date.now() - stat.mtimeMs) / 1000
      if (age < TTL) {
        const txt = await fs.promises.readFile(cacheFile, 'utf-8')
        return NextResponse.json(JSON.parse(txt))
      }
    } catch (e) {
      // no cache or unreadable -> continue
    }

    // Helper to write cache
    const writeCache = async (obj: any) => {
      try {
        await fs.promises.writeFile(cacheFile, JSON.stringify(obj), 'utf-8')
      } catch (e) {
        // ignore cache write errors
      }
    }

    // Try Graph API if token available
    if (token) {
      const endpoint = `https://graph.facebook.com/v17.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${encodeURIComponent(token)}&omitscript=false`
      try {
        const res = await fetch(endpoint)
        if (res.ok) {
          const json = await res.json()
          // try to download thumbnail if present
          if (json.thumbnail_url) {
            try {
              const imgUrl = json.thumbnail_url
              const imgRes = await fetch(imgUrl)
              if (imgRes.ok) {
                const buf = Buffer.from(await imgRes.arrayBuffer())
                const imgDir = path.join(process.cwd(), 'public', 'images', 'instagram')
                await fs.promises.mkdir(imgDir, { recursive: true })
                const extMatch = (imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/) || [])[1] || 'jpg'
                const safe = Buffer.from(url).toString('base64').replace(/=/g, '')
                const imgPath = path.join(imgDir, `${safe}.${extMatch}`)
                await fs.promises.writeFile(imgPath, buf)
                json.local_thumbnail = `/images/instagram/${safe}.${extMatch}`
              }
            } catch (e) {
              // ignore thumbnail download errors
            }
          }

          await writeCache(json)
          return NextResponse.json(json)
        }
      } catch (e) {
        // continue to fallback
      }
    }

    // Fallback: try legacy public oEmbed endpoint (may work for public posts)
    try {
      const legacy = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=false`
      const res2 = await fetch(legacy)
      if (res2.ok) {
        const json2 = await res2.json()
        // try to download thumbnail
        if (json2.thumbnail_url) {
          try {
            const imgUrl = json2.thumbnail_url
            const imgRes = await fetch(imgUrl)
            if (imgRes.ok) {
              const buf = Buffer.from(await imgRes.arrayBuffer())
              const imgDir = path.join(process.cwd(), 'public', 'images', 'instagram')
              await fs.promises.mkdir(imgDir, { recursive: true })
              const extMatch = (imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/) || [])[1] || 'jpg'
              const safe = Buffer.from(url).toString('base64').replace(/=/g, '')
              const imgPath = path.join(imgDir, `${safe}.${extMatch}`)
              await fs.promises.writeFile(imgPath, buf)
              json2.local_thumbnail = `/images/instagram/${safe}.${extMatch}`
            }
          } catch (e) {
            // ignore
          }
        }
        await writeCache(json2)
        return NextResponse.json(json2)
      }
    } catch (e) {
      // continue
    }

    // If we get here, attempts failed — try scraping the public page for og:image as a last resort
    try {
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (pageRes.ok) {
        const html = await pageRes.text()
        const m = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']\s*\/?>/i)
        if (m && m[1]) {
          const imgUrl = m[1]
          try {
            const imgRes = await fetch(imgUrl)
            if (imgRes.ok) {
              const buf = Buffer.from(await imgRes.arrayBuffer())
              const imgDir = path.join(process.cwd(), 'public', 'images', 'instagram')
              await fs.promises.mkdir(imgDir, { recursive: true })
              const extMatch = (imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/) || [])[1] || 'jpg'
              const safe = Buffer.from(url).toString('base64').replace(/=/g, '')
              const imgPath = path.join(imgDir, `${safe}.${extMatch}`)
              await fs.promises.writeFile(imgPath, buf)
              const scraped = { html: `<a href="${url}" target="_blank" rel="noreferrer"><img src="/images/instagram/${safe}.${extMatch}" style="width:100%;height:100%;object-fit:cover;"/></a>`, local_thumbnail: `/images/instagram/${safe}.${extMatch}` }
              await writeCache(scraped)
              return NextResponse.json(scraped)
            }
          } catch (e) {
            // ignore image download errors
          }
        }
      }
    } catch (e) {
      // ignore scraping errors
    }

    // If scraping failed, return cached if exists (stale allowed)
    try {
      const txt = await fs.promises.readFile(cacheFile, 'utf-8')
      return NextResponse.json(JSON.parse(txt))
    } catch (e) {
      return NextResponse.json({ error: 'Failed to fetch oEmbed and no cache available' }, { status: 502 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
