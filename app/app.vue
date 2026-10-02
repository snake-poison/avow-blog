<script setup lang="ts">
import { siteName } from '~/constants/site'

useHead({
  titleTemplate: title => title && title !== siteName ? `${title} | ${siteName}` : siteName,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
