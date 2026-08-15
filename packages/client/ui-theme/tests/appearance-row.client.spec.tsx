// @vitest-environment jsdom
/** AppearanceRow behavior: six cubes, selection follows the persisted
 * preference, clicks drive setTheme. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { AppearanceRow } from '../src/client/AppearanceRow.tsx'
import type { AppearanceRowComponentProps } from '../src/client/AppearanceRow.tsx'
import { createAppearanceRowStore } from '../src/client/settings-store.ts'
import type { ThemePreference } from '../src/client/index.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'appearance.wechat': 'Soft chat',
  'appearance.lightTexture': 'Light texture',
  'appearance.customBackground': 'Custom background',
  'appearance.background.empty': 'Choose an image',
  'appearance.background.choose': 'Choose image',
  'appearance.background.fit': 'Image fit',
  'appearance.background.fit.cover': 'Fill window',
  'appearance.background.fit.contain': 'Show full image',
  'appearance.background.overlay': 'Overlay',
  'appearance.background.blur': 'Blur',
  'appearance.background.transparency': 'Window transparency',
  'appearance.background.windowBlur': 'Window blur',
  'appearance.background.privacy': 'Local only',
}

const background = { image: '', overlay: 28, blur: 0, fit: 'cover' as const, transparency: 45, windowBlur: 24 }

/** Empty global standard-kit hooks (the row reads neither). */
function emptySessions() {
  const store = createSnapshotStore<SessionListState>(
    { ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined })
  return bindSnapshotSelector(store)
}
function emptyWorkspaces() {
  const store = createSnapshotStore<WorkspaceListState>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
    baselinesReady: true, recentWorkspaceId: undefined,
  })
  return bindSnapshotSelector(store)
}

function mount(preference: ThemePreference = 'system') {
  // Real store instance — the sanctioned zero-machinery path for tests.
  const store = createAppearanceRowStore().create()
  store.actions.sync(preference, background, 0)
  const setTheme = vi.fn()
  const setCustomBackground = vi.fn()
  const previewCustomBackground = vi.fn()
  const props: AppearanceRowComponentProps = {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setTheme,
    setCustomBackground,
    previewCustomBackground,
  }
  render(<AppearanceRow {...props} />)
  return { store, setTheme, setCustomBackground, previewCustomBackground }
}

const pressed = (name: RegExp): string | null =>
  screen.getByRole('button', { name }).getAttribute('aria-pressed')

describe('AppearanceRow', () => {
  it('renders the title and six cubes with the preference cube selected', () => {
    mount('dark')
    expect(screen.getByText('Appearance')).toBeDefined()
    expect(pressed(/Dark/)).toBe('true')
    expect(pressed(/^Light$/)).toBe('false')
    expect(pressed(/System/)).toBe('false')
    expect(pressed(/Soft chat/)).toBe('false')
    expect(pressed(/Light texture/)).toBe('false')
    expect(pressed(/Custom background/)).toBe('false')
  })

  it('routes both product themes through the persisted preference boundary', () => {
    const b = mount('light')
    fireEvent.click(screen.getByRole('button', { name: /Soft chat/ }))
    expect(b.setTheme).toHaveBeenCalledWith('wechat')
    act(() => { b.store.actions.sync('wechat', background, 1) })
    expect(pressed(/Soft chat/)).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /Light texture/ }))
    expect(b.setTheme).toHaveBeenLastCalledWith('light-texture')
    act(() => { b.store.actions.sync('light-texture', background, 2) })
    expect(pressed(/Light texture/)).toBe('true')
  })

  it('click drives setTheme; selection follows the store mirror, not the click echo', () => {
    const b = mount('dark')
    fireEvent.click(screen.getByRole('button', { name: /^Light$/ }))
    expect(b.setTheme).toHaveBeenCalledWith('light')
    // No store write yet: selection is unchanged.
    expect(pressed(/Dark/)).toBe('true')
    act(() => { b.store.actions.sync('light', background, 1) })
    expect(pressed(/^Light$/)).toBe('true')
    expect(pressed(/Dark/)).toBe('false')
  })

  it('previews range movement and only commits when the interaction completes', () => {
    const b = mount('custom-background')
    fireEvent.change(screen.getByRole('combobox', { name: /Image fit/ }), { target: { value: 'contain' } })
    expect(b.setCustomBackground).toHaveBeenCalledWith('fit', 'contain')
    const overlay = screen.getByRole('slider', { name: /Overlay/ })
    fireEvent.change(overlay, { target: { value: '42' } })
    expect(b.previewCustomBackground).toHaveBeenCalledWith('overlay', 42)
    expect(b.setCustomBackground).not.toHaveBeenCalledWith('overlay', 42)
    act(() => { b.store.actions.sync('custom-background', { ...background, overlay: 42 }, 1) })
    fireEvent.pointerUp(screen.getByRole('slider', { name: /Overlay/ }))
    expect(b.setCustomBackground).toHaveBeenCalledWith('overlay', 42)
    const transparency = screen.getByRole('slider', { name: /Window transparency/ })
    fireEvent.change(transparency, { target: { value: '60' } })
    expect(b.previewCustomBackground).toHaveBeenCalledWith('transparency', 60)
    const windowBlur = screen.getByRole('slider', { name: /Window blur/ })
    fireEvent.change(windowBlur, { target: { value: '32' } })
    expect(b.previewCustomBackground).toHaveBeenCalledWith('windowBlur', 32)
  })
})
