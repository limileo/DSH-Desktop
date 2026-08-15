import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('../src/styles/wechat.css', import.meta.url)), 'utf8')

describe('WeChat-inspired theme sheet', () => {
  it('is scoped to the resolved theme id and defines the core visual surfaces', () => {
    expect(css).toContain("body[data-ds-theme='wechat']")
    for (const token of [
      '--dsw-alias-brand-primary',
      '--dsw-specific-sidebar-fill',
      '--dsw-specific-bubble',
      '--dsw-specific-input-major',
      '--dsw-specific-conversation-fill',
    ]) {
      expect(css).toContain(`${token}:`)
    }
  })

  it('keeps the treatment brand-neutral instead of embedding WeChat assets', () => {
    expect(css).not.toMatch(/url\(/)
  })
})
