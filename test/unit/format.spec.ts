import { formatDate, isoDate, tagSlug } from '~/utils/format'

describe('formatDate', () => {
  it('reads a frontmatter date as the calendar day it names, in any time zone', () => {
    expect(formatDate('2026-10-02T00:00:00.000Z')).toBe('October 2, 2026')
    expect(formatDate(new Date(Date.UTC(2026, 0, 1)))).toBe('January 1, 2026')
  })
})

describe('isoDate', () => {
  it('is yyyy-mm-dd', () => {
    expect(isoDate('2026-10-02T00:00:00.000Z')).toBe('2026-10-02')
  })
})

describe('tagSlug', () => {
  it.each([
    ['Claims process', 'claims-process'],
    ['  Water / Mold  ', 'water-mold'],
    ['ALE (loss of use)', 'ale-loss-of-use'],
  ])('%s -> %s', (tag, slug) => {
    expect(tagSlug(tag)).toBe(slug)
  })
})
