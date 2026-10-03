import { readdirSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'

interface Author { ai?: boolean }
interface Post { file: string, author?: string, reviewedBy?: string, draft?: boolean }

// content.config.ts checks each post on its own, so it cannot see that `author` names a file in
// content/authors, or that a post an AI assistant drafted needs a person to vouch for it. The
// build would still pass: the byline would just go missing, or the post would go out unreviewed.
const authors = new Map(readdirSync('content/authors')
  .filter(name => name.endsWith('.yml'))
  .map(name => [name.replace(/\.yml$/, ''), parse(readFileSync(`content/authors/${name}`, 'utf8')) as Author]))

const posts: Post[] = readdirSync('content/blog')
  .filter(name => name.endsWith('.md'))
  .map((name) => {
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(readFileSync(`content/blog/${name}`, 'utf8'))?.[1] ?? ''
    return { file: name, ...(parse(frontmatter) as Omit<Post, 'file'>) }
  })

describe('the posts in content/blog', () => {
  it('credit only authors in content/authors', () => {
    const unknown = posts.flatMap(post => [post.author, post.reviewedBy]
      .filter(id => id != null && !authors.has(id))
      .map(id => `${post.file}: ${id}`))
    expect(unknown).toEqual([])
  })

  it('name a person as reviewer when an AI assistant drafted them', () => {
    const unreviewed = posts
      .filter(post => post.draft !== true && authors.get(post.author ?? '')?.ai === true)
      .filter(post => post.reviewedBy == null || !authors.has(post.reviewedBy) || authors.get(post.reviewedBy)?.ai === true)
      .map(post => post.file)
    expect(unreviewed).toEqual([])
  })
})
