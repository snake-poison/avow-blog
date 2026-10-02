import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { z } from 'zod'
import { audienceIds } from './app/constants/site'

/*
 * Posts live in content/blog/<slug>.md and render at /blog/<slug>. The schema is the SEO
 * contract: a post without a description, a date or an audience fails the build, not the
 * search result.
 */
const blog = defineCollection({
  type: 'page',
  source: 'blog/**/*.md',
  schema: z.object({
    // Search results cut a description at about 155 characters.
    description: z.string().min(50).max(160),
    date: z.date(),
    updated: z.date().optional(),
    // An id from content/authors/<id>.yml.
    author: z.string(),
    audience: z.array(z.enum(audienceIds)).min(1),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    // The answer in two or three sentences, shown above the body. Search and answer engines
    // quote the first plain statement on a page, so this is the one they should find.
    summary: z.string().optional(),
    // Rendered as a FAQ section and as schema.org FAQPage.
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
    // Set at build time from the body (nuxt.config.ts, content:file:afterParse).
    readingTime: z.number().default(1),
    // Drafts render in `pnpm dev` and never reach the built site, the sitemap or llms.txt.
    sitemap: defineSitemapSchema({ z, name: 'blog', filter: entry => entry.draft !== true }),
  }),
})

/** The people posts are written by: who they are is part of why a reader should trust the post. */
const authors = defineCollection({
  type: 'data',
  source: 'authors/*.yml',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    url: z.url().optional(),
    // Profiles elsewhere (LinkedIn, a licence lookup) for schema.org Person.sameAs.
    sameAs: z.array(z.url()).default([]),
  }),
})

export default defineContentConfig({
  collections: { blog, authors },
})
