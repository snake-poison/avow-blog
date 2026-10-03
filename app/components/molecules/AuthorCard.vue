<script setup lang="ts">
import type { AuthorsCollectionItem } from '@nuxt/content'

/** Who an author is and why to trust them, linking to their page. */
const props = defineProps<{
  author: AuthorsCollectionItem
  /** What they did on this post: "Written by", "Reviewed by". */
  kicker: string
}>()

const to = authorPath(authorId(props.author))
</script>

<template>
  <UICard as="section" radius="2xl" :aria-label="`${props.kicker} ${props.author.name}`" class="flex gap-4 sm:gap-5">
    <AuthorAvatar :author="props.author" :size="64" />
    <div class="min-w-0">
      <UIText variant="label">
        {{ props.kicker }}
      </UIText>
      <UIText variant="title" class="mt-1 text-base">
        <NuxtLink :to="to" class="hover:underline">
          {{ props.author.name }}
        </NuxtLink>
      </UIText>
      <UIText variant="small">
        {{ props.author.role }}
      </UIText>
      <UIText class="mt-3">
        {{ props.author.bio }}
      </UIText>
      <UIText v-if="props.author.license" variant="small" class="mt-3 flex items-start gap-1.5">
        <span class="mt-0.5 icon-[carbon--certificate-check] shrink-0 text-accent-2" aria-hidden="true" />
        <a :href="props.author.license.url" rel="noopener" class="underline underline-offset-2 hover:text-ink" data-license>
          {{ props.author.license.name }} (NAIC lookup)
        </a>
      </UIText>
    </div>
  </UICard>
</template>
