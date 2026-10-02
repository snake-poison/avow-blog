import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const publicDir = '.output/public'
export const siteUrl = 'https://snake-poison.github.io'

/** Every page a reader can land on, by URL path (`/blog/x/`), with its built file. */
export function pages(): Array<{ path: string, file: string }> {
  const found: Array<{ path: string, file: string }> = []
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('_'))
          walk(full)
      }
      else if (entry.name === 'index.html') {
        found.push({ path: `/${relative(publicDir, dir)}/`.replace('//', '/'), file: full })
      }
    }
  }
  walk(publicDir)
  return found.sort((a, b) => a.path.localeCompare(b.path))
}

export function readPage(file: string): Document {
  return new DOMParser().parseFromString(readFileSync(file, 'utf8'), 'text/html') as unknown as Document
}

/**
 * The file GitHub Pages answers a path with, without a redirect, or undefined. A page path
 * without its trailing slash counts as missing: Pages answers it with a 301.
 */
export function fileFor(path: string): string | undefined {
  const clean = path.replace(/[?#].*$/, '')
  const file = clean.endsWith('/') ? join(publicDir, clean, 'index.html') : join(publicDir, clean)
  return existsSync(file) && statSync(file).isFile() ? file : undefined
}

export interface SourcePost { slug: string, path: string, draft: boolean, hasFaq: boolean }

/** The posts under content/blog, from their frontmatter, independent of the build. */
export function sourcePosts(): SourcePost[] {
  return readdirSync('content/blog')
    .filter(name => name.endsWith('.md'))
    .map((name) => {
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join('content/blog', name), 'utf8'))?.[1] ?? ''
      const slug = name.replace(/\.md$/, '')
      return {
        slug,
        path: `/blog/${slug}/`,
        draft: /^draft:\s*true\s*$/m.test(frontmatter),
        hasFaq: /^faq:\s*$/m.test(frontmatter),
      }
    })
}

/** The schema.org nodes in a page's JSON-LD graph. */
export function schemaNodes(doc: Document): Array<Record<string, unknown>> {
  return [...doc.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap((script) => {
      const json = JSON.parse(script.textContent ?? '{}') as { '@graph'?: Array<Record<string, unknown>> }
      return json['@graph'] ?? [json]
    })
}

export function hasType(node: Record<string, unknown>, type: string): boolean {
  const types = node['@type']
  return Array.isArray(types) ? types.includes(type) : types === type
}
