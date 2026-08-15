import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('../src/styles/light-texture.css', import.meta.url)), 'utf8')

describe('Light Texture theme sheet', () => {
  it('is scoped and defines palette, atmosphere, component geometry, and material depth', () => {
    expect(css).toContain("body[data-ds-theme='light-texture']")
    for (const token of [
      '--dsw-specific-app-background',
      '--dsw-specific-sidebar-shell-radius',
      '--dsw-specific-sidebar-shell-border-inline-end',
      '--dsw-specific-sidebar-column-divider',
      '--dsw-specific-conversation-shell-radius',
      '--dsw-specific-conversation-shell-border-inline-start',
      '--dsw-specific-assistant-radius',
      '--dsw-specific-bubble-radius',
      '--dsw-specific-input-radius',
      '--dsw-specific-settings-radius',
      '--dsw-specific-tab-active-fill',
      '--dsw-specific-tab-strip-padding-bottom',
    ]) {
      expect(css).toContain(`${token}:`)
    }
    expect(css).toMatch(/backdrop: blur\(/)
    expect(css).toMatch(/inset 0 1px/)
    expect(css).toMatch(/radial-gradient\(/)
    expect(css).toContain('--dsw-specific-sidebar-shell-radius: 10px')
    expect(css).toContain('--dsw-specific-conversation-shell-radius: 10px')
    expect(css).toContain('--dsw-specific-sidebar-shell-margin: 10px 5px 10px 10px')
    expect(css).toContain('--dsw-specific-conversation-shell-margin: 10px 10px 10px 5px')
    expect(css).toContain('--dsw-specific-sidebar-shell-height-adjust: 20px')
    expect(css).toContain('--dsw-specific-conversation-shell-height-adjust: 20px')
    expect(css).toContain('--dsw-specific-tab-strip-padding-bottom: 8px')
    expect(css).toContain('--dsw-specific-assistant-backdrop: none')
    expect(css).toContain('--dsw-specific-bubble-backdrop: none')
    expect(css).toContain('--dsw-specific-conversation-backdrop: none')
    expect(css).not.toContain('background-attachment: fixed')
  })

  it('uses generated CSS atmosphere without embedding reference assets', () => {
    expect(css).not.toMatch(/url\(/)
  })
})
