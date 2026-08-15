/**
 * Appearance row slot store: a mirror of the theme service snapshot. The
 * plugin's apply-world change listener is the only writer; the row component
 * reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { CustomBackgroundSettings, ThemePreference } from '../theme-settings.ts'

/** Store state mirrored from the theme snapshot. */
export interface AppearanceRowState {
  /** Persisted preference (selection state reads this, never the resolved active theme). */
  preference: ThemePreference
  /** Persisted controls for the custom-background editor. */
  customBackground: CustomBackgroundSettings
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type AppearanceRowActions = {
  sync: (
    draft: AppearanceRowState,
    preference: ThemePreference,
    customBackground: CustomBackgroundSettings,
    revision: number,
  ) => void
}

/**
 * Declares the Appearance row state and write surface.
 * @returns the store handle.
 */
export function createAppearanceRowStore(): EngineStoreHandle<AppearanceRowState, AppearanceRowActions> {
  return defineStore({
    init: (): AppearanceRowState => ({
      preference: 'system',
      customBackground: { image: '', overlay: 28, blur: 0, fit: 'cover', transparency: 45, windowBlur: 24 },
      revision: -1,
    }),
    actions: {
      sync: (d, preference: ThemePreference, customBackground: CustomBackgroundSettings, revision: number) => {
        if (revision <= d.revision) return
        d.preference = preference
        d.customBackground = customBackground
        d.revision = revision
      },
    },
  })
}
