<script setup lang="ts">
import type { AuthorsCollectionItem } from '@nuxt/content'

/** An author's headshot, round, or Avow's mark for an author without one. Decorative. */
const props = defineProps<{
  author: Pick<AuthorsCollectionItem, 'image'>
  /** The rendered width and height, in pixels. */
  size: 24 | 64 | 112
  eager?: boolean
}>()

const sizeClass = { 24: 'size-6', 64: 'size-16', 112: 'size-28' }[props.size]
</script>

<template>
  <NuxtImg
    v-if="props.author.image"
    :src="props.author.image"
    alt=""
    :width="props.size"
    :height="props.size"
    densities="x1 x2"
    format="webp"
    :loading="props.eager ? 'eager' : 'lazy'"
    class="shrink-0 rounded-full border border-rule-soft bg-paper-2"
    :class="sizeClass"
  />
  <span
    v-else
    class="grid shrink-0 place-items-center rounded-full border border-rule-soft bg-paper-2"
    :class="sizeClass"
    aria-hidden="true"
  >
    <UIAppLogo class="size-3/5" />
  </span>
</template>
