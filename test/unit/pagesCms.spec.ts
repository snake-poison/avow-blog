import { readdirSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { audienceIds } from '~/constants/site'

interface Field { name: string, fields?: Field[], options?: { values?: Array<{ name: string }> } }
interface Config { content: Array<{ name: string, fields: Field[] }> }

// .pages.yml lists the authors and audiences as fixed choices. Pages CMS cannot read them from
// the content, so this keeps the editor from offering one the build would reject, or missing one.
const config = parse(readFileSync('.pages.yml', 'utf8')) as Config
const postFields = config.content.find(entry => entry.name === 'posts')!.fields

function choices(name: string): string[] {
  return postFields.find(field => field.name === name)?.options?.values?.map(value => value.name) ?? []
}

describe('the Pages CMS post editor', () => {
  it('offers every author in content/authors, and no other', () => {
    const authors = readdirSync('content/authors').filter(name => name.endsWith('.yml')).map(name => name.replace(/\.yml$/, ''))
    expect(choices('author').toSorted()).toEqual(authors.toSorted())
  })

  it('offers the audiences the content schema accepts', () => {
    expect(choices('audience')).toEqual([...audienceIds])
  })
})
