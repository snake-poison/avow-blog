import { defineNuxtConfig } from 'nuxt/config'

/*
 * Avow's design system as a Nuxt layer: the machine-style tokens, the self-hosted fonts and the
 * shared atoms. The app extends it (nuxt.config.ts). README.md here says where each file comes
 * from and how to keep it in step with Avow.
 */
export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode'],

  css: [
    '#layers/ui/app/assets/css/fonts.css',
    '#layers/ui/app/assets/css/tokens.css',
  ],

  components: [
    { path: '~/components', pathPrefix: false },
  ],
})
