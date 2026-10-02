<script setup lang="ts">
import { siteName } from '~/constants/site'

const route = useRoute()

// Every page names its own URL as canonical: the site origin, the base path, no trailing slash.
const canonical = withSiteUrl(computed(() => route.path), { withBase: true })

useHead({
  titleTemplate: title => title && title !== siteName ? `${title} | ${siteName}` : siteName,
  link: [{ rel: 'canonical', href: canonical }],
})
useSeoMeta({
  ogUrl: canonical,
  ogSiteName: siteName,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
