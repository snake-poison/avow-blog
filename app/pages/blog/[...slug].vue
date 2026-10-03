<script setup lang="ts">
import { audiences } from '~/constants/site'

const route = useRoute('blog-slug')

const { data: post } = await useAsyncData(`post:${route.path}`, async () =>
  queryCollection('blog').path(route.path).first())

if (post.value == null || ((post.value.draft || isScheduled(post.value.date)) && !import.meta.dev)) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}
const page = post.value

const [{ data: credited }, { data: related }] = await Promise.all([
  useAsyncData(`authors:${creditedIds(page).join(',')}`, async () =>
    queryCollection('authors').where('stem', 'IN', creditedIds(page).map(id => `authors/${id}`)).all()),
  // Posts for the same first reader, the links a reader who finished this one wants next.
  useAsyncData(`post:${route.path}:related`, async () =>
    queryPosts().where('audience', 'LIKE', `%"${page.audience[0] ?? 'homeowners'}"%`).where('path', '<>', page.path).limit(3).all()),
])
const author = credited.value?.find(item => authorId(item) === page.author)
const reviewer = page.reviewedBy == null ? undefined : credited.value?.find(item => authorId(item) === page.reviewedBy)

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
  articleAuthor: author == null ? undefined : [author.name],
  articleTag: page.tags,
})

const origin = useSiteConfig().url
const authorPersonNode = author == null ? undefined : authorPerson(author, origin)
const reviewerPersonNode = reviewer == null ? undefined : authorPerson(reviewer, origin)

useSchemaOrg([
  defineArticle({
    '@type': 'BlogPosting',
    'headline': page.title,
    'description': page.description,
    'datePublished': published,
    'dateModified': modified,
    'keywords': page.tags,
    'audience': page.audience.map(id => ({ '@type': 'Audience', 'audienceType': audiences[id].label })),
    // A post drafted by an AI assistant is Avow's: the assistant is named on the page, and the
    // person who checked it is the page's reviewedBy.
    'author': { '@id': authorPersonNode?.['@id'] ?? '#identity' },
  }),
  defineWebPage({
    '@type': page.faq.length > 0 ? ['WebPage', 'FAQPage'] : 'WebPage',
    'reviewedBy': reviewerPersonNode == null ? undefined : { '@id': reviewerPersonNode['@id'] },
  }),
  ...[authorPersonNode, reviewerPersonNode].filter(node => node != null).map(node => definePerson(node)),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Blog', item: '/blog/' },
      { name: page.title, item: `${page.path}/` },
    ],
  }),
  ...page.faq.map(item => defineQuestion({ name: item.question, acceptedAnswer: item.answer })),
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
      <!-- Who, then when: two lines, so neither breaks mid-way on a phone. -->
      <div v-if="author" class="mt-6 flex items-center justify-center gap-3">
        <span class="flex shrink-0 -space-x-2">
          <AuthorAvatar :author="author" :size="24" eager class="ring-2 ring-paper" />
          <AuthorAvatar v-if="reviewer" :author="reviewer" :size="24" eager class="ring-2 ring-paper" />
        </span>
        <UIText variant="label" as="p" class="flex flex-wrap gap-x-3 gap-y-0.5 text-left">
          <span>By <NuxtLink :to="authorPath(page.author)" class="hover:text-ink hover:underline">{{ author.name }}</NuxtLink><template v-if="author.credential">, {{ author.credential }}</template></span>
          <span v-if="reviewer" class="hidden sm:inline" aria-hidden="true">·</span>
          <span v-if="reviewer">Reviewed by <NuxtLink :to="authorPath(authorId(reviewer))" class="hover:text-ink hover:underline">{{ reviewer.name }}</NuxtLink><template v-if="reviewer.credential">, {{ reviewer.credential }}</template></span>
        </UIText>
      </div>
      <UIText variant="label" as="p" class="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
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
      <UIBadge v-else-if="isScheduled(page.date)" tone="info" class="mt-4">
        Scheduled: goes live {{ formatDate(page.date) }}
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

          <div class="space-y-4">
            <AuthorCard v-if="author" :author="author" kicker="Written by" />
            <AuthorCard v-if="reviewer" :author="reviewer" kicker="Reviewed by" />
          </div>
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

<!-- A post's body styles, inlined into post pages only: other pages never render one. -->
<style src="~/assets/css/prose.css"></style>
