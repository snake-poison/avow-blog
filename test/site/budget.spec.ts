import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { pages, readPage } from './site'

/*
 * What a page may cost. Pages are text, so the whole page is its HTML: styles inlined, no
 * script but the theme's, nothing preloaded. A change that breaks a budget should say why it
 * is worth it, here, by raising the number.
 */
// 22 KB, from 20: the 48-hours guide, at about 1,500 words with an author, a reviewer and
// their credentials, reached 20 on its text alone. Other pages are about 14.
const HTML_GZIP_BUDGET = 22 * 1024
const INLINE_SCRIPT_BUDGET = 4 * 1024

describe.each(pages())('$path', ({ file }) => {
  const html = readFileSync(file)
  const doc = readPage(file)

  it(`is under ${HTML_GZIP_BUDGET / 1024} KB compressed`, () => {
    expect(gzipSync(html).length).toBeLessThanOrEqual(HTML_GZIP_BUDGET)
  })

  it('loads no script file and no stylesheet', () => {
    expect(doc.querySelectorAll('script[src]')).toHaveLength(0)
    expect(doc.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(0)
    expect(doc.querySelectorAll('link[rel="modulepreload"], link[rel="preload"], link[rel="prefetch"]')).toHaveLength(0)
  })

  it(`runs under ${INLINE_SCRIPT_BUDGET / 1024} KB of inline script`, () => {
    const inline = [...doc.querySelectorAll('script:not([type="application/ld+json"])')]
      .reduce((sum, script) => sum + (script.textContent?.length ?? 0), 0)
    expect(inline).toBeLessThanOrEqual(INLINE_SCRIPT_BUDGET)
  })
})
