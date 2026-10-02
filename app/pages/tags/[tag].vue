<script setup lang="ts">
const route = useRoute('tags-tag')
const slug = route.params.tag

// Tags are free text in frontmatter, so the page finds the posts whose tag has this slug.
const { data: posts } = await useAsyncData(`posts:tag:${slug}`, async () => {
  const all = await queryPosts().all()
  return all.filter(post => post.tags.some(tag => tagSlug(tag) === slug))
})

const tagName = posts.value?.[0]?.tags.find(tag => tagSlug(tag) === slug)
if (tagName == null) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = `Posts about ${tagName}`
const description = `Avow Blog posts about ${tagName}, for homeowners, insurance professionals and public adjusters.`
useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
useSchemaOrg([
  defineWebPage({ '@type': 'CollectionPage' }),
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Blog', item: '/blog/' }, { name: tagName, item: `/tags/${slug}/` }] }),
])
defineOgImage('AvowBlog', { title, kicker: 'Avow Blog' })
</script>

<template>
  <div>
    <UIText variant="kicker">
      Tag
    </UIText>
    <UIHeading :level="1" size="xl" class="mt-3">
      {{ tagName }}
    </UIHeading>
    <UIDivider class="mt-8 mb-6" />
    <PostList :posts="posts ?? []" />
  </div>
</template>
