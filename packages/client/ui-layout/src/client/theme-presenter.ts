/**
 * Global theme DOM applier: projects the resolved ThemeSnapshot onto the
 * document — `html { color-scheme }` for native UA chrome (scrollbars, form
 * controls), `body[data-ds-dark-theme]` for the token palette, the active
 * theme's alias-token overrides as inline CSS variables on body, and one
 * presenter-owned `meta[name="theme-color"]` for surrounding browser UI. Pure
 * DOM writes, no React involvement; the presenter only ever retracts what it
 * wrote itself, so foreign attributes, metadata, and inline styles survive.
 */
import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Body attribute selecting the dark base palette in the token stylesheets. */
export const DARK_ATTRIBUTE = 'data-ds-dark-theme'

/** Body attribute exposing the resolved theme id to built-in theme sheets. */
export const THEME_ATTRIBUTE = 'data-ds-theme'

/** Applies theme snapshots to the document; one instance per plugin fiber. */
export class ThemePresenter {
  /** Token values written in the last apply (diff source and retraction set). */
  private readonly appliedTokens = new Map<string, string>()
  /** Last structural presentation, used to avoid redundant style invalidation. */
  private appliedScheme: 'light' | 'dark' | undefined
  private appliedThemeId: string | undefined
  /** The single metadata node this presenter inserts and removes. */
  private readonly themeColorMeta: HTMLMetaElement

  /** Create the presenter-owned metadata node before the first snapshot arrives. */
  constructor() {
    this.themeColorMeta = document.createElement('meta')
    this.themeColorMeta.name = 'theme-color'
  }

  /**
   * Project a snapshot onto the document: set root `color-scheme` and the body
   * palette attribute from `active.colorScheme` (never the id — `system` is
   * resolved upstream), then replace the previously applied token variables
   * with `active.tokens`. Browser theme-color metadata follows the computed
   * body background after those writes, so the rendered palette remains the
   * color authority.
   * @param snapshot - resolved theme snapshot from ctx.theme.
   */
  apply(snapshot: ThemeSnapshot): void {
    const scheme = snapshot.active.colorScheme
    const body = document.body
    const structureChanged = this.appliedScheme !== scheme || this.appliedThemeId !== snapshot.active.id
    if (this.appliedScheme !== scheme) {
      document.documentElement.style.colorScheme = scheme
      if (scheme === 'dark') body.setAttribute(DARK_ATTRIBUTE, '')
      else body.removeAttribute(DARK_ATTRIBUTE)
      this.appliedScheme = scheme
    }
    if (this.appliedThemeId !== snapshot.active.id) {
      body.setAttribute(THEME_ATTRIBUTE, snapshot.active.id)
      this.appliedThemeId = snapshot.active.id
    }
    const nextTokens = snapshot.active.tokens
    for (const name of this.appliedTokens.keys()) {
      if (name in nextTokens) continue
      body.style.removeProperty(name)
      this.appliedTokens.delete(name)
    }
    for (const [name, value] of Object.entries(nextTokens)) {
      if (this.appliedTokens.get(name) === value) continue
      body.style.setProperty(name, value)
      this.appliedTokens.set(name, value)
    }
    if (structureChanged || !this.themeColorMeta.isConnected) {
      this.themeColorMeta.content = getComputedStyle(body).backgroundColor
      if (!this.themeColorMeta.isConnected) document.head.append(this.themeColorMeta)
    }
  }

  /** Retract root color-scheme, the palette attribute, token variables, and the owned metadata node. */
  dispose(): void {
    document.documentElement.style.removeProperty('color-scheme')
    const body = document.body
    body.removeAttribute(DARK_ATTRIBUTE)
    body.removeAttribute(THEME_ATTRIBUTE)
    for (const name of this.appliedTokens.keys()) body.style.removeProperty(name)
    this.appliedTokens.clear()
    this.appliedScheme = undefined
    this.appliedThemeId = undefined
    this.themeColorMeta.remove()
  }
}
