<script setup lang="ts">
import { audienceIds, audiences, publisher, siteName } from '~/constants/site'

// The bar of Avow's own header (AppNavHeader): frosted paper, the mark and a light wordmark,
// ghost links in the middle and the one call to action on the right.
const route = useRoute()

function isCurrent(id: string): boolean {
  return route.path.startsWith(`/for/${id}`)
}

const links = audienceIds.map(id => ({ id, to: `/for/${id}`, label: audiences[id].label, short: audiences[id].short }))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-rule-soft bg-paper-2/75 text-ink backdrop-blur-lg">
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-2.5" :aria-label="`${siteName} home`">
        <UIAppLogo class="size-8" aria-hidden="true" />
        <span class="text-lg font-semibold tracking-tight">Avow</span>
        <span class="h-4 w-px bg-rule" aria-hidden="true" />
        <span class="text-lg font-medium tracking-tight text-ink-faint">Blog</span>
      </NuxtLink>

      <nav aria-label="Topics" class="hidden md:block">
        <ul class="flex items-center gap-1">
          <li v-for="link in links" :key="link.id">
            <NuxtLink
              :to="link.to"
              class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
              :class="isCurrent(link.id) ? 'bg-accent-2-soft text-accent-2' : 'text-ink-soft hover:bg-ink/6 hover:text-ink'"
              :aria-current="isCurrent(link.id) ? 'page' : undefined"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex shrink-0 items-center gap-2">
        <UIThemeToggle />
        <a
          :href="publisher.url"
          class="inline-flex rounded-full bg-accent px-3.5 py-1.5 text-[0.8125rem] font-semibold text-paper-2 shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-accent/45 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-2 motion-reduce:hover:translate-y-0 sm:px-4 sm:py-2 sm:text-sm"
        >
          <span class="sm:hidden">Join Avow</span>
          <span class="hidden sm:inline">Become a member</span>
        </a>
      </div>
    </div>

    <!-- Below md the topics get their own row, by their short names. -->
    <nav aria-label="Topics" class="border-t border-rule-soft md:hidden">
      <ul class="mx-auto grid max-w-5xl grid-cols-3 gap-1 px-3 py-2">
        <li v-for="link in links" :key="link.id">
          <NuxtLink
            :to="link.to"
            class="block rounded-full px-2 py-1 text-center text-[0.8125rem] font-semibold whitespace-nowrap"
            :class="isCurrent(link.id) ? 'bg-accent-2-soft text-accent-2' : 'text-ink-soft'"
            :aria-current="isCurrent(link.id) ? 'page' : undefined"
          >
            {{ link.short }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
