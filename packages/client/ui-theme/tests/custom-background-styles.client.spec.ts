import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('../src/styles/custom-background.css', import.meta.url)), 'utf8')

describe('custom-background.css', () => {
  it('scopes wallpaper and translucent component treatment to the theme id', () => {
    expect(css).toContain("body[data-ds-theme='custom-background'] {")
    expect(css).toContain("body[data-ds-theme='custom-background']::before")
    expect(css).toContain('--dsw-custom-background-image')
    expect(css).toContain('--dsw-custom-background-overlay')
    expect(css).toContain('--dsw-custom-background-blur')
    expect(css).toContain('--dsw-custom-background-fit')
    expect(css).toContain('--dsw-custom-window-opacity')
    expect(css).toContain('--dsw-custom-window-blur')
    expect(css).toContain('--dsw-specific-sidebar-backdrop: blur(')
    expect(css).toContain('--dsw-specific-conversation-backdrop: blur(')
    expect(css).toContain('--dsw-specific-input-backdrop: none')
    expect(css).toContain('--dsw-specific-bubble-backdrop: none')
  })

  it('ships fallbacks so the Host bootstrap never paints an empty wallpaper', () => {
    expect(css).toMatch(/--dsw-custom-background-image,\s*linear-gradient/)
    expect(css).toContain('--dsw-custom-background-overlay, rgba(18, 22, 28, 0.28)')
    expect(css).toContain('--dsw-custom-background-fit, cover')
    expect(css).toContain('--dsw-custom-background-blur, 0px')
  })
})
