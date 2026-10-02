<script setup lang="ts">
import type { Audience } from '~/constants/site'
import { audienceIds, audiences } from '~/constants/site'

const route = useRoute('for-audience')

function isAudience(value: string): value is Audience {
  return audienceIds.some(id => id === value)
}

const id = route.params.audience
if (!isAudience(id)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
const audience = audiences[id]

useSeoMeta({
  title: audience.title,
  description: audience.description,
  ogTitle: audience.title,
  ogDescription: audience.description,
})
useSchemaOrg([
  defineWebPage({ '@type': 'CollectionPage' }),
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: audience.label, item: `/for/${id}/` }] }),
])
defineOgImage('AvowBlog', { title: audience.title, kicker: 'Avow Blog' })

// Audiences are stored as a JSON array, so a quoted id matches one whole entry.
const { data: posts } = await useAsyncData(`posts:for:${id}`, async () =>
  queryPosts().where('audience', 'LIKE', `%"${id}"%`).all())
</script>

<template>
  <div>
    <UIText variant="kicker">
      For {{ audience.label.toLowerCase() }}
    </UIText>
    <UIHeading :level="1" size="xl" class="mt-3">
      {{ audience.title }}
    </UIHeading>
    <UIText class="mt-3 max-w-2xl text-base">
      {{ audience.description }}
    </UIText>
    <UIDivider class="mt-8 mb-6" />
    <PostList :posts="posts ?? []" />
  </div>
</template>
