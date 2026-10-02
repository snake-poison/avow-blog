# Avow Blog

Plain answers on property insurance claims for homeowners, insurance professionals and public
adjusters. A static site built with Nuxt 4 and Nuxt Content, on the same stack and design
system as the [Avow app](https://github.com/snake-poison/Avow), served from GitHub Pages.

## Writing a post

Add `content/blog/<slug>.md`. It is published at `/blog/<slug>/`.

```md
---
title: What to do in the first 48 hours after property damage
description: 50 to 160 characters. Search results show this under the title.
date: 2026-10-02
updated: 2026-11-01          # optional; shown, and used as dateModified
author: avow-team            # content/authors/<id>.yml
audience: [homeowners, public-adjusters]   # one or more of: homeowners, insurance, public-adjusters
tags: [Claims process]       # each gets a page at /tags/<slug>/
summary: The answer in two or three plain sentences, shown first.
faq:                         # optional; a FAQ section and schema.org FAQPage
  - question: …
    answer: …
draft: true                  # shown in `pnpm dev`, never built
---
```

The build fails on a post that breaks the schema in `content.config.ts`.

**For search and answer engines.** Put the answer first: the `summary`, then a first paragraph
that states it plainly. Use question-shaped `##` headings where a reader would ask one. Add an
`faq` for the questions people search word for word. Name a real author with a role and bio.
Each post is listed in `/llms.txt` and its Markdown is served at `/raw/blog/<slug>.md`.

## Commands

```sh
pnpm dev          # http://localhost:3000, drafts included
pnpm generate     # the static site in .output/public
pnpm preview      # serve that build
pnpm lint --fix
pnpm typecheck
pnpm test:unit    # fast
pnpm test         # unit, then builds the site and checks it (pnpm test:site)
pnpm ds:diff      # compare the design system with ~/Code/Avow
```

## How it is built

- **Static, with no JS runtime.** Every route is prerendered HTML with its CSS inlined, and
  ships no Nuxt runtime (`routeRules` in `nuxt.config.ts`). The only script is the theme's
  (`app/constants/themeScript.ts`). `test/site/budget.spec.ts` holds each page to 20 KB
  compressed with no script or stylesheet requests.
- **SEO.** Canonical URLs, Open Graph and Twitter tags, a generated share image per page
  (`components/OgImage`), schema.org (`BlogPosting`, `Person`, `BreadcrumbList`, `FAQPage`,
  `Organization`), `sitemap.xml` and `robots.txt`. `test/site` checks all of it in the build.
- **Design system.** `layers/ui` is Avow's tokens, fonts and atoms. See its README.
- **URLs end in a slash** (`/blog/<slug>/`): each page is `index.html` in its own directory,
  which is how GitHub Pages serves without a redirect.

## Project layout

```
app/
  pages/           /, /blog/, /blog/<slug>/, /for/<audience>/, /tags/<tag>/
  components/      molecules and organisms built from the layer's atoms
  constants/       site identity and audiences (site.ts), the theme script
  utils/           post queries, formatting, reading time
  assets/css/      the Tailwind entry and post body styles
components/OgImage the share card
content/
  blog/            posts
  authors/         authors
layers/ui/         Avow's design system
test/
  unit/            pure functions
  site/            the built site
```

## Deploying

Pushing to `main` runs `.github/workflows/ci.yml`: lint, typecheck, tests, the build and its
checks, then a deploy to GitHub Pages. In the repository settings, set Pages > Source to
"GitHub Actions".

Serve it from a custom domain (for example `blog.itsavow.com`): set it under Settings > Pages,
and the workflow builds for it. On the default `snake-poison.github.io/avow-public/` the site
works, but crawlers ignore a `robots.txt` below the domain root, so none is published, and the
sitemap lists the base path twice.
