import type { BlogCollectionItem } from '@nuxt/content'

/** What a post list shows. Lists select only these, so a list page's payload carries no bodies. */
export const postListFields = ['path', 'title', 'description', 'date', 'audience', 'tags', 'readingTime', 'image', 'author', 'reviewedBy'] as const

export type PostListItem = Pick<BlogCollectionItem, typeof postListFields[number]>

/** Published posts, newest first. `pnpm dev` lists drafts too, so a draft can be read in place. */
export function queryPosts() {
  const query = queryCollection('blog').select(...postListFields).order('date', 'DESC')
  return import.meta.dev ? query : query.where('draft', '=', false)
}
