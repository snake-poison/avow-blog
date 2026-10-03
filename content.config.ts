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
    // The day it goes live. A later date schedules it: see app/utils/schedule.ts.
    date: z.date(),
    updated: z.date().optional(),
    // An id from content/authors/<id>.yml.
    author: z.string(),
    // The licensed person who checked the post, by author id. Shown beside the byline, and the
    // reason to trust a post drafted by an AI assistant.
    reviewedBy: z.string().optional(),
    audience: z.array(z.enum(audienceIds)).min(1),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // The lead photo: a path under public/, shown under the title and on the post's card.
    image: z.object({
      src: z.string().startsWith('/'),
      alt: z.string(),
      caption: z.string().optional(),
      // Who took it, and the page that licenses it.
      credit: z.string(),
      creditUrl: z.url().optional(),
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
    // Drafts and scheduled posts render in `pnpm dev` and never reach the built site, the sitemap
    // or llms.txt. The sitemap module copies this callback into the server bundle as source, so
    // it cannot import isScheduled() from app/utils/schedule.ts: it repeats it, and the site
    // tests check the two agree.
    sitemap: defineSitemapSchema({
      z,
      name: 'blog',
      filter: (entry) => {
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
        return entry.draft !== true && new Date(entry.date).toISOString().slice(0, 10) <= today
      },
    }),
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
    // An AI writing assistant, not a person: never marked up as a schema.org Person, and its
    // posts are credited to Avow in structured data.
    ai: z.boolean().default(false),
    // After the name in a post's byline: "By Ramy Melo, licensed public adjuster".
    credential: z.string().optional(),
    url: z.url().optional(),
    // A square headshot under public/.
    image: z.string().startsWith('/').optional(),
    // The licence that qualifies them to write on claims, and the regulator's page that shows
    // it. Insurance is a Your Money or Your Life topic: search engines weigh this.
    license: z.object({
      name: z.string(),
      issuer: z.string(),
      url: z.url(),
    }).optional(),
    knowsAbout: z.array(z.string()).default([]),
    // Profiles elsewhere (LinkedIn, a licence lookup) for schema.org Person.sameAs.
    sameAs: z.array(z.url()).default([]),
  }),
})

export default defineContentConfig({
  collections: { blog, authors },
})
