import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { publicDir } from './site'

// GitHub Pages answers /blog/x/ with blog/x/index.html. A blog/x.html beside a blog/x/
// directory is ambiguous there, so every page is an index.html in its own directory.
describe('the output', () => {
  it('has no page outside an index.html but the 404 and SPA fallbacks', () => {
    const strays = readdirSync(publicDir, { recursive: true, encoding: 'utf8' })
      .filter(path => path.endsWith('.html') && !path.endsWith('index.html'))
      .map(path => join(publicDir, path))
    expect(strays.sort()).toEqual([join(publicDir, '200.html'), join(publicDir, '404.html')])
  })
})
