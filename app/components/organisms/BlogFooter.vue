<script setup lang="ts">
import { audienceIds, audiences, publisher } from '~/constants/site'
</script>

<template>
  <footer class="border-t border-rule-soft">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div class="max-w-sm">
        <UIText variant="kicker">
          Avow
        </UIText>
        <UIText class="mt-2">
          Put your deductible to work. Earn vault yield, document your property, and get adjuster review before you file.
        </UIText>
        <UILink :to="publisher.url" class="mt-3 inline-block">
          Visit itsavow.com
        </UILink>
      </div>

      <nav aria-label="Footer">
        <UIText variant="label" as="h2">
          Read by topic
        </UIText>
        <ul class="mt-3 space-y-2">
          <li v-for="id in audienceIds" :key="id">
            <UILink :to="`/for/${id}`" variant="muted">
              {{ audiences[id].label }}
            </UILink>
          </li>
          <li>
            <UILink to="/blog" variant="muted">
              All posts
            </UILink>
          </li>
          <li>
            <UILink to="/authors" variant="muted">
              Authors
            </UILink>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</template>
