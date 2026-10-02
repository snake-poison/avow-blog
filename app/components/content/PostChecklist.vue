<script setup lang="ts">
/**
 * A list to work through, drawn as a card of tick boxes that prints cleanly. In Markdown,
 * a task list inside the block:
 *
 *   ::post-checklist{title="The 48-hour checklist"}
 *   - [ ] Everyone out and safe
 *   ::
 */
const props = defineProps<{
  title: string
}>()
</script>

<template>
  <section class="post-checklist rounded-3xl border border-rule bg-panel p-6 sm:p-8" :aria-label="props.title">
    <p class="font-mono text-xs font-semibold tracking-widest text-accent uppercase">
      Save or print this
    </p>
    <p class="mt-2 font-heading text-2xl font-bold text-ink">
      {{ props.title }}
    </p>
    <div class="post-checklist__items mt-5">
      <slot />
    </div>
  </section>
</template>
