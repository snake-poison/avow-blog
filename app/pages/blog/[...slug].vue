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
</script>

<template>
  <article class="mx-auto max-w-3xl">
    <nav aria-label="Breadcrumb">
      <UIText variant="label" as="div">
        <ol class="flex flex-wrap items-center gap-2">
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

    <header class="mt-6">
      <UIText variant="kicker" as="p" class="flex flex-wrap gap-x-3">
        <NuxtLink v-for="id in page.audience" :key="id" :to="`/for/${id}`" class="hover:underline">
          For {{ audiences[id].label.toLowerCase() }}
        </NuxtLink>
      </UIText>
      <UIHeading :level="1" size="xl" class="mt-3">
        {{ page.title }}
      </UIHeading>
      <UIText variant="label" as="p" class="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1">
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

    <UICard v-if="page.summary" variant="callout" tone="info" radius="2xl" class="mt-8">
      <UIText variant="label" as="h2">
        In short
      </UIText>
      <UIText class="mt-2 text-base text-ink">
        {{ page.summary }}
      </UIText>
    </UICard>

    <ContentRenderer :value="page" class="post-body mt-8" />

    <PostFaq v-if="page.faq.length > 0" :items="page.faq" class="mt-14" />

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

      <UICard v-if="author" as="section" radius="2xl" aria-label="About the author">
        <UIText variant="label">
          Written by
        </UIText>
        <UIText variant="title" class="mt-2 text-base">
          {{ author.name }}
        </UIText>
        <UIText variant="small">
          {{ author.role }}
        </UIText>
        <UIText class="mt-3">
          {{ author.bio }}
        </UIText>
      </UICard>
    </footer>

    <section v-if="related && related.length > 0" aria-labelledby="related-heading" class="mt-14">
      <UIHeading id="related-heading" :level="2" size="xs" uppercase>
        Keep reading
      </UIHeading>
      <UIDivider class="mt-3 mb-6" />
      <PostList :posts="related" :level="3" />
    </section>
  </article>
</template>
