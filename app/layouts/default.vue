<template>
  <div class="machine-root flex min-h-screen flex-col">
    <div class="machine-texture" aria-hidden="true" />
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
    >
      Skip to content
    </a>

    <BlogHeader />

    <main id="main" class="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <slot />
    </main>

    <BlogFooter />
  </div>
</template>
