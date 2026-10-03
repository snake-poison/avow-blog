import type { AuthorsCollectionItem } from '@nuxt/content'

/** An author's id, the name of their file in content/authors: `authors/ramy-melo` → `ramy-melo`. */
export function authorId(author: Pick<AuthorsCollectionItem, 'stem'>): string {
  return author.stem.replace(/^authors\//, '')
}

export function authorPath(id: string): string {
  return `/authors/${id}`
}

/** The authors a post credits, as writer or reviewer. */
export function creditedIds(post: Pick<PostListItem, 'author' | 'reviewedBy'>): string[] {
  return post.reviewedBy == null ? [post.author] : [post.author, post.reviewedBy]
}

/**
 * The schema.org Person for an author, under one @id at their profile page, so every post and
 * the profile describe the same person. An AI assistant is not a person and has none. `origin`
 * is the site's (useSiteConfig().url): references to a node need its full @id.
 */
export function authorPerson(author: AuthorsCollectionItem, origin: string) {
  if (author.ai === true)
    return undefined
  const license = author.license
  const page = `${origin.replace(/\/$/, '')}${authorPath(authorId(author))}/`
  return {
    '@id': `${page}#person`,
    'name': author.name,
    'jobTitle': author.role,
    'description': author.bio,
    'url': page,
    'image': author.image == null ? undefined : `${origin.replace(/\/$/, '')}${author.image}`,
    'knowsAbout': author.knowsAbout,
    'hasCredential': license == null
      ? undefined
      : {
          '@type': 'EducationalOccupationalCredential',
          'credentialCategory': 'license',
          'name': license.name,
          'url': license.url,
          'recognizedBy': { '@type': 'Organization', 'name': license.issuer },
        },
    'sameAs': [...author.sameAs, ...(license == null ? [] : [license.url])],
  }
}
