/** Theme preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Built-in preferences accepted at the registry and settings boundaries. */
export const THEME_PREFERENCES = [
  'light', 'dark', 'system', 'wechat', 'light-texture', 'custom-background',
] as const

/** Settings namespace owned by the theme plugin. */
export const THEME_SETTINGS_NAMESPACE = 'ui-theme'

/** Field carrying the selected built-in theme preference. */
export const THEME_PREFERENCE_FIELD = 'preference'

/** Durable fields owned by the custom-background presentation. */
export const CUSTOM_BACKGROUND_IMAGE_FIELD = 'customBackgroundImage'
export const CUSTOM_BACKGROUND_OVERLAY_FIELD = 'customBackgroundOverlay'
export const CUSTOM_BACKGROUND_BLUR_FIELD = 'customBackgroundBlur'
export const CUSTOM_BACKGROUND_FIT_FIELD = 'customBackgroundFit'
export const CUSTOM_BACKGROUND_TRANSPARENCY_FIELD = 'customBackgroundTransparency'
export const CUSTOM_BACKGROUND_WINDOW_BLUR_FIELD = 'customBackgroundWindowBlur'

/** Image sizing options exposed by the Appearance settings row. */
export const CUSTOM_BACKGROUND_FITS = ['cover', 'contain'] as const
export type CustomBackgroundFit = typeof CUSTOM_BACKGROUND_FITS[number]

/** Product defaults for a readable custom background. */
export const DEFAULT_CUSTOM_BACKGROUND = Object.freeze({
  image: '',
  overlay: 28,
  blur: 0,
  fit: 'cover',
  transparency: 45,
  windowBlur: 24,
})

/** Persisted custom-background controls. */
export interface CustomBackgroundSettings {
  image: string
  overlay: number
  blur: number
  fit: CustomBackgroundFit
  /** Opacity of the foreground window surfaces, as a percentage. */
  transparency: number
  /** Backdrop blur applied behind foreground window surfaces, in CSS pixels. */
  windowBlur: number
}

/** Theme preference persisted by the product Appearance row. */
export type ThemePreference = typeof THEME_PREFERENCES[number]

/** Default preference when the user-settings document has no override. */
export const DEFAULT_PREFERENCE: ThemePreference = 'system'

/** Durable theme section shared by the Host schema and the browser scope. */
export interface ThemeSettings {
  /** Selected built-in preference. */
  preference: ThemePreference
  /** Self-contained data URL so the background survives source-file moves. */
  customBackgroundImage: string
  /** Dark readability veil, expressed as an integer percentage. */
  customBackgroundOverlay: number
  /** Background-only blur radius in CSS pixels. */
  customBackgroundBlur: number
  /** How the selected image fills the application window. */
  customBackgroundFit: CustomBackgroundFit
  /** Foreground window opacity, expressed as an integer percentage. */
  customBackgroundTransparency: number
  /** Foreground window backdrop blur radius in CSS pixels. */
  customBackgroundWindowBlur: number
}

/** Durable theme schema; also the wire envelope the browser scope validates against. */
export const ThemeSettingsSchema: z<ThemeSettings> = z.object({
  [THEME_PREFERENCE_FIELD]: z.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE),
  [CUSTOM_BACKGROUND_IMAGE_FIELD]: z.string().default(DEFAULT_CUSTOM_BACKGROUND.image),
  [CUSTOM_BACKGROUND_OVERLAY_FIELD]: z.number().min(0).max(70).default(DEFAULT_CUSTOM_BACKGROUND.overlay),
  [CUSTOM_BACKGROUND_BLUR_FIELD]: z.number().min(0).max(24).default(DEFAULT_CUSTOM_BACKGROUND.blur),
  [CUSTOM_BACKGROUND_FIT_FIELD]: z.union([...CUSTOM_BACKGROUND_FITS]).default(DEFAULT_CUSTOM_BACKGROUND.fit),
  [CUSTOM_BACKGROUND_TRANSPARENCY_FIELD]: z.number().min(0).max(100).default(DEFAULT_CUSTOM_BACKGROUND.transparency),
  [CUSTOM_BACKGROUND_WINDOW_BLUR_FIELD]: z.number().min(0).max(40).default(DEFAULT_CUSTOM_BACKGROUND.windowBlur),
})

/**
 * Narrow one wire or registry value to a persistable preference.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in preference.
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some(preference => preference === value)
}
