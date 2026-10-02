import { readFileSync } from 'node:fs'
import { fileFor, pages, publicDir, readPage, siteUrl } from './site'

const all = pages()

describe('every page', () => {
  it('was built', () => {
    expect(all.map(page => page.path)).toEqual(expect.arrayContaining(['/', '/blog/', '/for/homeowners/', '/for/insurance/', '/for/public-adjusters/']))
  })

  describe.each(all)('$path', ({ path, file }) => {
    const doc = readPage(file)
    function meta(selector: string) {
      return doc.querySelector(selector)?.getAttribute('content') ?? ''
    }

    it('has a title, and a description search results can show whole', () => {
      expect(doc.title.length).toBeGreaterThan(0)
      expect(meta('meta[name="description"]').length).toBeGreaterThanOrEqual(50)
      expect(meta('meta[name="description"]').length).toBeLessThanOrEqual(160)
      expect(doc.documentElement.getAttribute('lang')).toBe('en')
    })

    it('names its own URL as canonical, and og:url agrees', () => {
      const expected = `${siteUrl}${path}`
      expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(expected)
      expect(meta('meta[property="og:url"]')).toBe(expected)
    })

    it('has exactly one h1', () => {
      expect(doc.querySelectorAll('h1')).toHaveLength(1)
    })

    it('has a share image that was built', () => {
      const image = meta('meta[property="og:image"]')
      expect(image.startsWith(`${siteUrl}/`)).toBe(true)
      expect(fileFor(image.slice(siteUrl.length))).toBeDefined()
      expect(meta('meta[property="og:image:width"]')).toBe('1200')
      expect(meta('meta[property="og:image:height"]')).toBe('630')
    })

    it('links only to pages and files that exist, by the URL they are served at', () => {
      const hrefs = [...doc.querySelectorAll('a[href]')]
        .map(a => a.getAttribute('href') ?? '')
        .filter(href => href.startsWith('/'))
      for (const href of hrefs)
        expect(fileFor(href), `${path} links to ${href}`).toBeDefined()
    })
  })
})

describe('robots.txt', () => {
  it('lets every crawler in, AI crawlers included, and points at the sitemap', () => {
    const robots = readFileSync(`${publicDir}/robots.txt`, 'utf8')
    expect(robots).toMatch(/User-agent: \*\nDisallow:\s*\n/)
    expect(robots).toContain(`Sitemap: ${siteUrl}/sitemap.xml`)
  })
})

describe('sitemap.xml', () => {
  it('lists every built page, and only those', () => {
    const sitemap = readFileSync(`${publicDir}/sitemap.xml`, 'utf8')
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]!.slice(siteUrl.length) || '/')
    expect(locs.sort()).toEqual(all.map(page => page.path).sort())
  })
})
