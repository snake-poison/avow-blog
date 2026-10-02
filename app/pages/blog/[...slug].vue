<script setup lang="ts">
import { audiences } from '~/constants/site'

const route = useRoute('blog-slug')

const { data: post } = await useAsyncData(`post:${route.path}`, async () =>
  queryCollection('blog').path(route.path).first())

if (post.value == null || (post.value.draft && !import.meta.dev)) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}
const page = post.value

const [{ data: author }, { data: related }] = await Promise.all([
  useAsyncData(`author:${page.author}`, async () =>
    queryCollection('authors').where('stem', '=', `authors/${page.author}`).first()),
  // Posts for the same first reader, the links a reader who finished this one wants next.
  useAsyncData(`post:${route.path}:related`, async () =>
    queryPosts().where('audience', 'LIKE', `%"${page.audience[0] ?? 'homeowners'}"%`).where('path', '<>', page.path).limit(3).all()),
])

// content.config.ts requires at least one audience; the first is who the post is mainly for.
const mainAudience = audiences[page.audience[0] ?? 'homeowners']

const published = isoDate(page.date)
const modified = page.updated == null ? published : isoDate(page.updated)

useSeoMeta({
  title: page.title,
  description: page.description,
  ogType: 'article',
  ogTitle: page.title,
  ogDescription: page.description,
  articlePublishedTime: published,
  articleModifiedTime: modified,
  articleAuthor: author.value == null ? undefined : [author.value.name],
  articleTag: page.tags,
})

useSchemaOrg([
  defineArticle({
    '@type': 'BlogPosting',
    'headline': page.title,
    'description': page.description,
    'datePublished': published,
    'dateModified': modified,
    'keywords': page.tags,
    'audience': page.audience.map(id => ({ '@type': 'Audience', 'audienceType': audiences[id].label })),
    'author': author.value == null
      ? undefined
      : definePerson({
          name: author.value.name,
          jobTitle: author.value.role,
          description: author.value.bio,
          url: author.value.url,
          sameAs: author.value.sameAs,
        }),
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Blog', item: '/blog/' },
      { name: page.title, item: `${page.path}/` },
    ],
  }),
  ...(page.faq.length > 0
    ? [
        defineWebPage({ '@type': ['WebPage', 'FAQPage'] }),
        ...page.faq.map(item => defineQuestion({ name: item.question, acceptedAnswer: item.answer })),
      ]
    : []),
])

defineOgImage('AvowBlog', { title: page.title, kicker: mainAudience.label })

// The post's h2s, for the outline beside the body.
const toc = page.body.toc?.links ?? []
</script>

<template>
  <article>
    <header class="mx-auto max-w-3xl text-center">
      <nav aria-label="Breadcrumb">
        <UIText variant="label" as="div">
          <ol class="flex flex-wrap items-center justify-center gap-2">
            <li>
              <NuxtLink to="/" class="hover:text-ink">
                Home
              </NuxtLink>
            </li>
            <li aria-hidden="true">
              /
            </li>
            <li>
              <NuxtLink to="/blog" class="hover:text-ink">
                Blog
              </NuxtLink>
            </li>
          </ol>
        </UIText>
      </nav>

      <UIText variant="kicker" as="p" class="mt-8 flex flex-wrap justify-center gap-x-4">
        <NuxtLink v-for="id in page.audience" :key="id" :to="`/for/${id}`" class="hover:underline">
          For {{ audiences[id].label.toLowerCase() }}
        </NuxtLink>
      </UIText>
      <!-- Display size, past the atom's largest: the one headline on the page. -->
      <h1 class="mt-4 font-heading text-4xl/[1.05] font-bold tracking-[0.01em] text-balance text-ink sm:text-5xl/[1.02] lg:text-6xl/[1]">
        {{ page.title }}
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg/relaxed text-pretty text-ink-soft">
        {{ page.description }}
      </p>
      <UIText variant="label" as="p" class="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span v-if="author">By {{ author.name }}</span>
        <span v-if="author" aria-hidden="true">·</span>
        <time :datetime="published">{{ formatDate(page.date) }}</time>
        <template v-if="page.updated">
          <span aria-hidden="true">·</span>
          <span>Updated <time :datetime="modified">{{ formatDate(page.updated) }}</time></span>
        </template>
        <span aria-hidden="true">·</span>
        <span>{{ page.readingTime }} min read</span>
      </UIText>
      <UIBadge v-if="page.draft" tone="warn" class="mt-4">
        Draft: not published
      </UIBadge>
    </header>

    <PostPhoto
      v-if="page.image"
      lead
      :src="page.image.src"
      :alt="page.image.alt"
      :credit="page.image.credit"
      :credit-url="page.image.creditUrl"
      class="mt-10 sm:mt-12"
    >
      {{ page.image.caption }}
    </PostPhoto>

    <div class="mt-10 grid gap-x-14 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <div class="min-w-0">
        <UICard v-if="page.summary" as="section" variant="callout" tone="accent" radius="2xl" aria-label="In short">
          <UIText variant="kicker" as="p" tone="accent" class="flex items-center gap-2">
            <span class="icon-[carbon--flash-filled] text-sm" aria-hidden="true" />
            In short
          </UIText>
          <p class="mt-3 text-lg/relaxed text-ink">
            {{ page.summary }}
          </p>
        </UICard>

        <ContentRenderer :value="page" class="post-body mt-10" />

        <PostFaq v-if="page.faq.length > 0" :items="page.faq" class="mt-16" />

        <footer class="mt-14 space-y-8">
          <ul v-if="page.tags.length > 0" class="flex flex-wrap gap-2" aria-label="Tags">
            <li v-for="tag in page.tags" :key="tag">
              <NuxtLink :to="`/tags/${tagSlug(tag)}`">
                <UIBadge variant="outline">
                  {{ tag }}
                </UIBadge>
              </NuxtLink>
            </li>
          </ul>

          <UICard v-if="author" as="section" radius="2xl" aria-label="About the author" class="flex gap-4">
            <UIAppLogo class="size-12 shrink-0" />
            <div>
              <UIText variant="label">
                Written by
              </UIText>
              <UIText variant="title" class="mt-1 text-base">
                {{ author.name }}
              </UIText>
              <UIText variant="small">
                {{ author.role }}
              </UIText>
              <UIText class="mt-3">
                {{ author.bio }}
              </UIText>
            </div>
          </UICard>
        </footer>
      </div>

      <!-- The outline, beside the body on wide screens. Plain anchor links: no script. -->
      <aside v-if="toc.length > 0" class="hidden lg:block" aria-labelledby="toc-heading">
        <nav class="sticky top-24">
          <UIText id="toc-heading" variant="label" as="h2">
            On this page
          </UIText>
          <ol class="mt-4 space-y-2.5 border-l border-rule-soft">
            <li v-for="link in toc" :key="link.id">
              <a :href="`#${link.id}`" class="-ml-px block border-l border-transparent pl-4 text-sm/snug text-ink-soft hover:border-accent hover:text-ink">
                {{ link.text }}
              </a>
            </li>
          </ol>
        </nav>
      </aside>
    </div>

    <section v-if="related && related.length > 0" aria-labelledby="related-heading" class="mt-20">
      <UIHeading id="related-heading" :level="2" size="xs" uppercase>
        Keep reading
      </UIHeading>
      <UIDivider class="mt-3 mb-6" />
      <PostList :posts="related" :level="3" />
    </section>
  </article>
</template>
