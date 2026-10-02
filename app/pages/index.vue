<script setup lang="ts">
import { audienceIds, audiences, siteDescription, siteName } from '~/constants/site'

useSeoMeta({
  title: siteName,
  description: siteDescription,
  ogTitle: siteName,
  ogDescription: siteDescription,
})
useSchemaOrg([defineWebSite({ name: siteName, description: siteDescription })])
defineOgImage('AvowBlog', { title: 'Plain answers on property insurance claims', kicker: 'Avow Blog' })

const { data: posts } = await useAsyncData('posts:recent', () => queryPosts().limit(6).all())
</script>

<template>
  <div>
    <section class="max-w-3xl">
      <UIText variant="kicker">
        The Avow Blog
      </UIText>
      <UIHeading :level="1" size="xl" class="mt-3">
        Plain answers on property insurance claims
      </UIHeading>
      <UIText class="mt-4 text-base sm:text-lg">
        For homeowners, insurance professionals and public adjusters, from the team behind Avow.
      </UIText>
    </section>

    <section aria-labelledby="topics-heading" class="mt-12">
      <UIHeading id="topics-heading" :level="2" size="xs" uppercase>
        Read by topic
      </UIHeading>
      <ul class="mt-4 grid gap-4 sm:grid-cols-3">
        <li v-for="id in audienceIds" :key="id">
          <UICard as="article" padding="md" radius="2xl" class="relative h-full">
            <UIHeading :level="3" size="sm">
              <NuxtLink :to="`/for/${id}`" class="after:absolute after:inset-0 hover:text-accent">
                {{ audiences[id].label }}
              </NuxtLink>
            </UIHeading>
            <UIText class="mt-2">
              {{ audiences[id].description }}
            </UIText>
          </UICard>
        </li>
      </ul>
    </section>

    <section aria-labelledby="latest-heading" class="mt-14">
      <div class="flex items-baseline justify-between gap-4">
        <UIHeading id="latest-heading" :level="2" size="xs" uppercase>
          Latest
        </UIHeading>
        <UILink to="/blog" variant="muted">
          All posts
        </UILink>
      </div>
      <UIDivider class="mt-3 mb-6" />
      <PostList :posts="posts ?? []" :level="3" />
    </section>
  </div>
</template>
