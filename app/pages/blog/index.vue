<script setup lang="ts">
const title = 'All posts'
const description = 'Every post on the Avow Blog, newest first: insurance claims explained for homeowners, insurance professionals and public adjusters.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
useSchemaOrg([
  defineWebPage({ '@type': 'CollectionPage' }),
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Blog', item: '/blog/' }] }),
])
defineOgImage('AvowBlog', { title, kicker: 'Avow Blog' })

const { data: posts } = await useAsyncData('posts:all', () => queryPosts().all())
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
    <PostList :posts="posts ?? []" />
  </div>
</template>
