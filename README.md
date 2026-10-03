# Avow Blog

Plain answers on property insurance claims for homeowners, insurance professionals and public
adjusters. A static site built with Nuxt 4 and Nuxt Content, on the same stack and design
system as the [Avow app](https://github.com/snake-poison/Avow), served from GitHub Pages at
[blog.itsavow.com](https://blog.itsavow.com).

## Writing a post

Add `content/blog/<slug>.md`. It is published at `/blog/<slug>/`.

```md
---
title: What to do in the first 48 hours after property damage
description: 50 to 160 characters. Search results show this under the title.
date: 2026-10-02
updated: 2026-11-01          # optional; shown, and used as dateModified
author: ramy-melo            # content/authors/<id>.yml
reviewedBy: ramy-melo        # optional; the licensed person who checked it
audience: [homeowners, public-adjusters]   # one or more of: homeowners, insurance, public-adjusters
tags: [Claims process]       # each gets a page at /tags/<slug>/
image:                       # optional; the lead photo, also on the post's card
  src: /images/blog/<slug>/lead.jpg
  alt: What the photo shows, for someone who cannot see it.
  caption: optional
  credit: Name / Source
  creditUrl: https://…       # the page that licenses it
summary: The answer in two or three plain sentences, shown first.
faq:                         # optional; a FAQ section and schema.org FAQPage
  - question: …
    answer: …
draft: true                  # shown in `pnpm dev`, never built
---
```

The build fails on a post that breaks the schema in `content.config.ts`.

**Photos** go in `public/images/blog/<slug>/`, as JPEGs about 2000px wide. The build turns each
into AVIF and WebP at the widths the page needs. Use photos you have the rights to: the first
post's are public-domain FEMA photos from Wikimedia Commons, credited anyway.

**Blocks** for the body, from `app/components/content` (styled in `assets/css/prose.css`):

```md
::post-steps                      numbered steps on a rail; each ## inside is a step
:post-when[Within 24 hours]       a kicker over the next step's heading
## Report the claim
::

::post-photo{src="/images/blog/x/y.jpg" alt="…" credit="Name / FEMA" credit-url="https://…"}
The caption.
::

::post-callout{tone="danger" title="Leave first"}   tone: accent, info, warn, danger
::post-pullquote                  the one line to remember, set large
::post-checklist{title="…"}       a task list (- [ ] …) as a printable card
```

**For search and answer engines.** Put the answer first: the `summary`, then a first paragraph
that states it plainly. Use question-shaped `##` headings where a reader would ask one. Add an
`faq` for the questions people search word for word. Name a real author: `content/authors/<id>.yml` takes a role, a bio, a square headshot
(`image`), the byline `credential` and a `license` with the regulator's lookup URL. Insurance
is a Your Money or Your Life topic, so search engines look for who wrote a post and why to trust
them; the license goes into the post's structured data as a credential. An author with
`ai: true` (Hana) is an AI writing assistant: name a `reviewedBy` on its posts, which are
credited to Avow in structured data rather than to a person. Every author credited on a
published post gets a page at `/authors/<id>/`, listed at `/authors/`.
Each post is listed in `/llms.txt` and its Markdown is served at `/raw/blog/<slug>.md`.

### In the browser, with Pages CMS

[Pages CMS](https://app.pagescms.org) edits posts and authors from a form, configured by
`.pages.yml`. Sign in with GitHub and open this repository. Each save is a commit to the branch
you are on, so a save to `main` publishes once CI passes. New posts start as drafts: untick
Draft to publish. Uploaded photos go to `public/images/`, and any size is fine because the build
resizes them.

The body is a Markdown source editor, not a rich-text one, because the rich-text editor would
flatten the blocks above. A new author also has to be added to the `author` choices in
`.pages.yml`; `test/unit/pagesCms.spec.ts` fails until it is.

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
  components/      molecules and organisms built from the layer's atoms; content/ for posts
  constants/       site identity and audiences (site.ts), the theme script
  utils/           post queries, formatting, reading time
  assets/css/      the Tailwind entry and post body styles
components/OgImage the share card
content/
  blog/            posts
  authors/         authors
public/images/blog/  post photos
layers/ui/         Avow's design system
test/
  unit/            pure functions
  site/            the built site
  fixtures/        a draft the test build adds, to check drafts never ship
```

## Deploying

Pushing to `main` runs `.github/workflows/ci.yml`: lint, typecheck, tests, the build and its
checks, then a deploy to GitHub Pages. In the repository settings, set Pages > Source to
"GitHub Actions".

The site is built for `https://blog.itsavow.com` (`nuxt.config.ts`, `public/CNAME`). DNS, in
Cloudflare: a `CNAME` record from `blog` to `snake-poison.github.io`, set to DNS only (not
proxied) so GitHub can issue the certificate. Then Settings > Pages > Custom domain is
`blog.itsavow.com`, with Enforce HTTPS on.

After each deploy, `scripts/indexnow.mjs` sends IndexNow (Bing, Yandex, Seznam and others) the
pages that are new or have a newer `lastmod` than the sitemap that was live before. The key is
`public/<key>.txt`, a file holding its own name. To resend every page, run
`pnpm generate && node scripts/indexnow.mjs --all`. Google does not use IndexNow; it reads the
sitemap, submitted in Search Console.
