import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'
import { publisher, siteDescription, siteName } from './app/constants/site'
import { readingMinutes } from './app/utils/readingTime'

// The canonical origin. Set NUXT_SITE_URL when the blog moves to its own domain. GitHub Pages
// serves a project site under /<repo>/, which the deploy workflow passes as NUXT_APP_BASE_URL.
const siteUrl = process.env.NUXT_SITE_URL ?? 'https://snake-poison.github.io'
const baseURL = process.env.NUXT_APP_BASE_URL ?? '/'

export default defineNuxtConfig({
  // layers/ui, the design system (Avow's tokens, fonts and atoms), is extended automatically:
  // Nuxt registers every directory under layers/. See layers/ui/README.md.

  modules: [
    '@nuxt/content',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    'nuxt-llms',
    '@nuxt/eslint',
    // Satori is slow to start and nothing in a test reads a share card.
    ...(process.env.VITEST == null ? ['nuxt-og-image'] : []),
  ],

  devtools: { enabled: true },

  site: {
    url: siteUrl,
    name: siteName,
    description: siteDescription,
    defaultLocale: 'en',
    trailingSlash: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        // No font preloads: fonts.css says why.
      ],
      script: [
        {
          // Runs before the inlined styles, so a dark-mode reader never sees a light first
          // frame. The color-mode module's own script only runs after them (Avow #442).
          innerHTML: `(function(){const e=window.matchMedia('(prefers-color-scheme: dark)').matches,t=localStorage.getItem('nuxt-color-mode');('dark'===t||!t&&e)&&document.documentElement.classList.add('dark')})();`,
          type: 'text/javascript',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['json', 'js', 'ts', 'bash', 'yaml', 'md'],
        },
        toc: { depth: 3 },
      },
    },
  },

  // Inline the page's CSS in its HTML: one request fewer before first paint.
  features: { inlineStyles: true },

  experimental: {
    typedPages: true,
  },

  compatibilityDate: '2026-01-01',

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/sitemap.xml', '/robots.txt', '/llms.txt', '/llms-full.txt'],
      // /blog/<slug>.html, not /blog/<slug>/index.html. GitHub Pages serves the first at
      // /blog/<slug> and redirects the second to /blog/<slug>/, a hop on every visit and a URL
      // that no longer matches the canonical.
      autoSubfolderIndex: false,
    },
    compressPublicAssets: false,
  },

  vite: {
    plugins: [tailwindcss() as unknown as never],
    build: {
      target: 'esnext',
      cssMinify: 'esbuild',
    },
  },

  hooks: {
    'content:file:afterParse': function (ctx) {
      if (ctx.collection.name === 'blog' && typeof ctx.file.body === 'string') {
        ctx.content.readingTime = readingMinutes(ctx.file.body)
      }
    },
  },

  colorMode: {
    classSuffix: '',
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: publisher.name,
      url: publisher.url,
      logo: publisher.logo,
    },
  },

  ogImage: {
    zeroRuntime: true,
    // Satori cannot read woff2, hence the woff copies under layers/ui/public/og-fonts.
    defaults: {
      fonts: [
        { name: 'Archivo Narrow', weight: 700, path: '/og-fonts/archivo-narrow-700.woff' },
        { name: 'IBM Plex Mono', weight: 500, path: '/og-fonts/ibm-plex-mono-500.woff' },
        { name: 'IBM Plex Mono', weight: 600, path: '/og-fonts/ibm-plex-mono-600.woff' },
      ],
    },
    compatibility: {
      dev: { sharp: false },
      prerender: { sharp: false },
      runtime: { sharp: false },
    },
  },

  llms: {
    // llms.txt links are the content paths, which do not carry the base.
    domain: `${siteUrl}${baseURL}`.replace(/\/$/, ''),
    title: siteName,
    description: siteDescription,
    full: {
      title: siteName,
      description: 'Every published post on the Avow Blog in full.',
    },
    sections: [
      {
        title: 'Posts',
        contentCollection: 'blog',
        contentFilters: [{ field: 'draft', operator: '=', value: false }],
      },
    ],
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
