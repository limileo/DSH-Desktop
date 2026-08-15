/** Appearance row store: snapshot-mirror action and the revision guard. */
import { describe, expect, it } from 'vitest'
import { createAppearanceRowStore } from '../src/client/settings-store.ts'

const background = { image: '', overlay: 28, blur: 0, fit: 'cover' as const, transparency: 45, windowBlur: 24 }

describe('createAppearanceRowStore', () => {
  it('init shape: system preference with revision at -1', () => {
    const store = createAppearanceRowStore().create()
    expect(store.getSnapshot()).toEqual({ preference: 'system', customBackground: background, revision: -1 })
  })

  it('sync mirrors the preference and advances the revision', () => {
    const store = createAppearanceRowStore().create()
    store.actions.sync('dark', background, 0)
    expect(store.getSnapshot()).toEqual({ preference: 'dark', customBackground: background, revision: 0 })
    store.actions.sync('light', { ...background, overlay: 40 }, 2)
    expect(store.getSnapshot().preference).toBe('light')
    expect(store.getSnapshot().customBackground.overlay).toBe(40)
    expect(store.getSnapshot().revision).toBe(2)
  })

  it('revision guard drops stale and duplicate writes', () => {
    const store = createAppearanceRowStore().create()
    store.actions.sync('dark', background, 3)
    store.actions.sync('system', background, 2)
    store.actions.sync('system', background, 3)
    expect(store.getSnapshot().preference).toBe('dark')
    expect(store.getSnapshot().revision).toBe(3)
  })
})
