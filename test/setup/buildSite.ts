import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, rmSync } from 'node:fs'
import process from 'node:process'
import { draftFixture } from '../site/site'

/**
 * Builds the static site the `site` specs read, with a draft post added for the draft specs,
 * unless SITE_BUILD=skip and a build is there.
 */
export default function setup(): void {
  if (process.env.SITE_BUILD === 'skip') {
    if (!existsSync('.output/public/index.html'))
      throw new Error('SITE_BUILD=skip but there is no .output/public. Run `pnpm generate` first.')
    return
  }
  // The build the site ships, not a test build: nuxt.config.ts leaves modules out under VITEST.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('VITEST') && key !== 'NODE_ENV'))
  copyFileSync(draftFixture.source, draftFixture.target)
  try {
    execFileSync('pnpm', ['exec', 'nuxi', 'generate'], { stdio: 'inherit', env })
  }
  finally {
    rmSync(draftFixture.target, { force: true })
  }
}
