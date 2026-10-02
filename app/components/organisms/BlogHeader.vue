<script setup lang="ts">
import { audienceIds, audiences, siteName } from '~/constants/site'
</script>

<template>
  <header class="border-b border-rule-soft">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5 text-ink" :aria-label="`${siteName} home`">
        <UIAppLogo class="h-7 w-auto" />
        <span class="font-heading text-xl font-bold tracking-[0.01em]">Avow</span>
        <UIText as="span" variant="kicker">Blog</UIText>
      </NuxtLink>

      <nav aria-label="Topics" class="flex items-center gap-1">
        <ul class="hidden items-center gap-5 md:flex">
          <li v-for="id in audienceIds" :key="id">
            <UILink :to="`/for/${id}`" variant="muted">
              {{ audiences[id].label }}
            </UILink>
          </li>
        </ul>
        <UIThemeToggle />
      </nav>
    </div>
  </header>
</template>
