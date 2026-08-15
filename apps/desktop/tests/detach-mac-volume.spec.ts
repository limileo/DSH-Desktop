import { describe, expect, it, vi } from 'vitest'
import { detachMacVolume } from '../scripts/detach-mac-volume.ts'

describe('detachMacVolume', () => {
  it('returns after a normal detach succeeds', () => {
    const run = vi.fn()

    detachMacVolume('/Volumes/DSH Desktop', { run })

    expect(run).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(['detach', '/Volumes/DSH Desktop'])
  })

  it('retries a busy volume before succeeding', () => {
    const run = vi.fn()
      .mockImplementationOnce(() => { throw new Error('Resource busy') })
      .mockImplementationOnce(() => { throw new Error('Resource busy') })
    const wait = vi.fn()

    detachMacVolume('/Volumes/DSH Desktop', { run, wait })

    expect(run).toHaveBeenCalledTimes(3)
    expect(wait).toHaveBeenCalledTimes(2)
    expect(wait).toHaveBeenNthCalledWith(1, 1_000)
    expect(wait).toHaveBeenNthCalledWith(2, 1_000)
  })

  it('forces detach after all normal attempts fail', () => {
    const run = vi.fn((args: readonly string[]) => {
      if (!args.includes('-force')) throw new Error('Resource busy')
    })
    const wait = vi.fn()
    const warn = vi.fn()

    detachMacVolume('/Volumes/DSH Desktop', { run, wait, warn })

    expect(run).toHaveBeenCalledTimes(4)
    expect(run).toHaveBeenLastCalledWith(['detach', '-force', '/Volumes/DSH Desktop'])
    expect(wait).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledOnce()
  })
})
