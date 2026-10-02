/**
 * The only script the blog ships. Pages render with no Nuxt runtime (routeRules in
 * nuxt.config.ts), so this does what the color-mode module and UIThemeToggle's click handler
 * would do after hydration. It goes into the head as source text, so it must not close over
 * anything outside itself.
 *
 * It runs before the inlined styles, so a dark-mode reader never sees a light first frame.
 * The key is the color-mode module's, so a preference set on itsavow.com's app carries over
 * on the same origin.
 */
export function themeScript(): void {
  const KEY = 'nuxt-color-mode'
  const root = document.documentElement
  const stored = localStorage.getItem(KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  root.classList.toggle('dark', stored === 'dark' || (stored == null && prefersDark))

  // UIThemeToggle is Avow's atom, kept as it is, so it is found by its accessible name.
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || event.target.closest('[aria-label="Toggle dark mode"]') == null)
      return
    const dark = root.classList.toggle('dark')
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
  })
}
