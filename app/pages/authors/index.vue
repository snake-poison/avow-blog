<script setup lang="ts">
const title = 'Authors'
const description = 'Who writes and reviews the Avow Blog, and the licenses and experience behind each post on property insurance claims.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
useSchemaOrg([
  defineWebPage({ '@type': 'CollectionPage' }),
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Authors', item: '/authors/' }] }),
])
defineOgImage('AvowBlog', { title, kicker: 'Avow Blog' })

// Only authors with a published post, as writer or reviewer: an author file alone is not a page.
const { data: people } = await useAsyncData('authors:all', async () => {
  const [authors, posts] = await Promise.all([queryCollection('authors').all(), queryPosts().all()])
  return authors
    .map(author => ({
      author,
      written: posts.filter(post => post.author === authorId(author)).length,
      reviewed: posts.filter(post => post.reviewedBy === authorId(author)).length,
    }))
    .filter(person => person.written + person.reviewed > 0)
    // People first, then by how much they have published.
    .sort((a, b) => Number(a.author.ai) - Number(b.author.ai) || (b.written + b.reviewed) - (a.written + a.reviewed))
})

function count(n: number, what: string): string {
  return `${n} ${n === 1 ? 'post' : 'posts'} ${what}`
}
</script>

<template>
  <div>
    <UIHeading :level="1" size="xl">
      {{ title }}
    </UIHeading>
    <UIText class="mt-3 max-w-2xl text-base">
      {{ description }}
    </UIText>
    <UIDivider class="mt-8 mb-6" />
    <ul class="grid gap-4 sm:grid-cols-2">
      <li v-for="{ author, written, reviewed } in people ?? []" :key="author.stem">
        <UICard radius="2xl" class="relative flex h-full gap-4">
          <AuthorAvatar :author="author" :size="64" />
          <div class="min-w-0">
            <UIText variant="title" as="h2" class="text-lg">
              <NuxtLink :to="authorPath(authorId(author))" class="after:absolute after:inset-0 hover:underline">
                {{ author.name }}
              </NuxtLink>
            </UIText>
            <UIText variant="small" class="mt-1">
              {{ author.role }}
            </UIText>
            <UIText variant="label" as="p" class="mt-3">
              {{ [written > 0 ? count(written, 'written') : '', reviewed > 0 ? count(reviewed, 'reviewed') : ''].filter(Boolean).join(' · ') }}
            </UIText>
          </div>
        </UICard>
      </li>
    </ul>
  </div>
</template>
