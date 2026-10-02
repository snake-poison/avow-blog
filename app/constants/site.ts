/**
 * Who the blog is, and who it is for. nuxt.config.ts reads these at build time, so this file
 * imports nothing from the app.
 */
export const siteName = 'Avow Blog'
export const siteDescription = 'Plain answers on property insurance claims for homeowners, insurance professionals and public adjusters, from the team behind Avow.'

/** The organisation every post is published by (schema.org Organization). */
export const publisher = {
  name: 'Avow',
  url: 'https://itsavow.com',
  logo: '/apple-touch-icon.png',
} as const

/**
 * The three readers the blog writes for. Each has a hub page at /for/<id>, and every post names
 * at least one in its frontmatter (content.config.ts), so a post is always reachable from a hub.
 */
export const audienceIds = ['homeowners', 'insurance', 'public-adjusters'] as const

export type Audience = typeof audienceIds[number]

export const audiences: Record<Audience, { label: string, title: string, description: string }> = {
  'homeowners': {
    label: 'Homeowners',
    title: 'Insurance claims for homeowners',
    description: 'How to document a loss, read your policy and get a fair settlement on a homeowners insurance claim.',
  },
  'insurance': {
    label: 'Insurance professionals',
    title: 'For insurance professionals',
    description: 'Claims handling, coverage questions and the policyholder side of property claims, for agents, carriers and adjusters.',
  },
  'public-adjusters': {
    label: 'Public adjusters',
    title: 'For public adjusters',
    description: 'Working claims for policyholders: documentation, estimates, appraisal and getting paid.',
  },
}
