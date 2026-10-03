import { readdirSync } from 'node:fs'
import { fileFor, hasType, publicDir, readPage, schemaNodes, siteUrl, sourcePosts } from './site'

const published = sourcePosts().filter(post => !post.draft)
const credited = [...new Set(published.flatMap(post => post.credited))].sort((a, b) => a.localeCompare(b))

describe('the author pages', () => {
  it('are built for every author a published post credits, and no other', () => {
    const built = readdirSync(`${publicDir}/authors`, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && fileFor(`/authors/${entry.name}/`) != null)
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b))
    expect(built).toEqual(credited)
  })

  it('are all listed on /authors/', () => {
    const links = [...readPage(fileFor('/authors/')!).querySelectorAll('main a[href^="/authors/"]')]
      .map(a => a.getAttribute('href') ?? '')
    expect(links.toSorted((a, b) => a.localeCompare(b))).toEqual(credited.map(id => `/authors/${id}/`))
  })

  it.each(credited)('/authors/%s/ is a profile page, about the person every post names', (id) => {
    const nodes = schemaNodes(readPage(fileFor(`/authors/${id}/`)!))
    const page = nodes.find(node => hasType(node, 'ProfilePage'))
    expect(page).toBeDefined()
    const person = nodes.find(node => hasType(node, 'Person'))
    // An AI assistant has a profile but is not a person.
    if (person != null) {
      expect(person['@id']).toBe(`${siteUrl}/authors/${id}/#person`)
      expect(page?.mainEntity).toEqual({ '@id': person['@id'] })
    }
  })

  it.each(published)('$path links to the pages of the authors it credits', ({ path, credited }) => {
    const links = [...readPage(fileFor(path)!).querySelectorAll('a[href^="/authors/"]')].map(a => a.getAttribute('href'))
    for (const id of credited)
      expect(links).toContain(`/authors/${id}/`)
  })
})
