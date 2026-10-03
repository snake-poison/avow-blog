<script setup lang="ts">
const route = useRoute('authors-author')
const id = route.params.author

const [{ data: author }, { data: posts }] = await Promise.all([
  useAsyncData(`author:${id}`, async () => queryCollection('authors').where('stem', '=', `authors/${id}`).first()),
  useAsyncData(`posts:author:${id}`, async () => {
    const all = await queryPosts().all()
    return {
      written: all.filter(post => post.author === id),
      reviewed: all.filter(post => post.reviewedBy === id && post.author !== id),
    }
  }),
])

const written = posts.value?.written ?? []
const reviewed = posts.value?.reviewed ?? []
// /authors/ lists only authors with a published post, and so does the site.
if (author.value == null || written.length + reviewed.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
const person = author.value
const profiles = person.sameAs.map(url => ({ url, host: new URL(url).hostname.replace(/^www\./, '') }))

const title = person.name
const description = `${person.role}. ${person.bio}`.slice(0, 157).replace(/\s+\S*$/, '…')
useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: 'profile' })
const personNode = authorPerson(person, useSiteConfig().url)
useSchemaOrg([
  defineWebPage({
    '@type': 'ProfilePage',
    'mainEntity': personNode == null ? undefined : { '@id': personNode['@id'] },
  }),
  ...(personNode == null ? [] : [definePerson(personNode)]),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Authors', item: '/authors/' },
      { name: person.name, item: `${authorPath(id)}/` },
    ],
  }),
])
defineOgImage('AvowBlog', { title, kicker: person.role })
</script>

<template>
  <div>
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
            <NuxtLink to="/authors" class="hover:text-ink">
              Authors
            </NuxtLink>
          </li>
        </ol>
      </UIText>
    </nav>

    <header class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
      <AuthorAvatar :author="person" :size="112" eager />
      <div class="min-w-0">
        <UIHeading :level="1" size="xl">
          {{ person.name }}
        </UIHeading>
        <UIText class="mt-2 text-base">
          {{ person.role }}
        </UIText>
      </div>
    </header>

    <UIText class="mt-8 max-w-2xl text-lg/relaxed">
      {{ person.bio }}
    </UIText>

    <ul v-if="person.license || profiles.length > 0" class="mt-6 space-y-2">
      <li v-if="person.license">
        <UIText variant="small" class="flex items-start gap-1.5">
          <span class="mt-0.5 icon-[carbon--certificate-check] shrink-0 text-accent-2" aria-hidden="true" />
          <span>
            <a :href="person.license.url" rel="noopener" class="underline underline-offset-2 hover:text-ink" data-license>{{ person.license.name }} (NAIC lookup)</a>,
            issued by {{ person.license.issuer }}
          </span>
        </UIText>
      </li>
      <li v-for="profile in profiles" :key="profile.url">
        <UILink :to="profile.url" variant="muted" external>
          {{ profile.host }}
        </UILink>
      </li>
    </ul>

    <section v-if="written.length > 0" aria-labelledby="written-heading" class="mt-14">
      <UIHeading id="written-heading" :level="2" size="xs" uppercase>
        Written by {{ person.name }}
      </UIHeading>
      <UIDivider class="mt-3 mb-6" />
      <PostList :posts="written" :level="3" />
    </section>

    <section v-if="reviewed.length > 0" aria-labelledby="reviewed-heading" class="mt-14">
      <UIHeading id="reviewed-heading" :level="2" size="xs" uppercase>
        Reviewed by {{ person.name }}
      </UIHeading>
      <UIDivider class="mt-3 mb-6" />
      <PostList :posts="reviewed" :level="3" />
    </section>
  </div>
</template>
