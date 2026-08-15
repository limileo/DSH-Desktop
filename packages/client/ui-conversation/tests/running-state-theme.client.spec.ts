import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const chatCss = readFileSync(fileURLToPath(new URL(
  '../src/client/chat/ChatView.module.css',
  import.meta.url,
)), 'utf8')
const stateDotCss = readFileSync(fileURLToPath(new URL(
  '../../ui-primitives/src/StateDot.module.css',
  import.meta.url,
)), 'utf8')

describe('ongoing state theme colors', () => {
  it('uses semantic theme accents for the turn shimmer and activity matrix', () => {
    expect(chatCss).toContain('var(--dsw-alias-state-business-primary)')
    expect(chatCss).toContain('var(--dsw-alias-state-business-tertiary)')
    expect(stateDotCss).toContain('--dsh-state-ongoing: var(--dsw-alias-state-business-primary)')
    expect(chatCss).not.toContain('var(--dsw-static-deepseek-')
    expect(stateDotCss).not.toContain('var(--dsw-static-deepseek-')
  })
})
