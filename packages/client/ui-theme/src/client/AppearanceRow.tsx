/** Appearance theme selector and custom-background editor. */
import clsx from 'clsx'
import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  IconDarkOutline16, IconFollowsystemOutline16, IconLightOutline16, IconNewChatOutline16,
  IconPersonalizationOutline16, IconSparkle16, IconTrashOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { CustomBackgroundSettings, ThemePreference } from '../theme-settings.ts'
import { BackgroundImageError, prepareBackgroundImage } from './background-image.ts'
import type { ThemeKey } from './locales.ts'
import type { createAppearanceRowStore } from './settings-store.ts'
import css from './AppearanceRow.module.css'

/** Injected business face: all writes stay behind the theme runtime. */
export interface AppearanceRowInjected {
  setTheme: (id: ThemePreference) => void
  setCustomBackground: (
    field: keyof CustomBackgroundSettings,
    value: string | number,
  ) => void
  previewCustomBackground: (
    field: 'overlay' | 'blur' | 'transparency' | 'windowBlur',
    value: number,
  ) => void
}

export type AppearanceRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createAppearanceRowStore>>
  & PropsLocale<'settings.theme'> & AppearanceRowInjected

const CUBES: readonly { id: ThemePreference; labelKey: ThemeKey; Icon: typeof IconLightOutline16 }[] = [
  { id: 'light', labelKey: 'appearance.light', Icon: IconLightOutline16 },
  { id: 'dark', labelKey: 'appearance.dark', Icon: IconDarkOutline16 },
  { id: 'system', labelKey: 'appearance.system', Icon: IconFollowsystemOutline16 },
  { id: 'wechat', labelKey: 'appearance.wechat', Icon: IconNewChatOutline16 },
  { id: 'light-texture', labelKey: 'appearance.lightTexture', Icon: IconSparkle16 },
  { id: 'custom-background', labelKey: 'appearance.customBackground', Icon: IconPersonalizationOutline16 },
]

/** Render the Appearance row and custom-background controls. */
export function AppearanceRow({
  t, setTheme, setCustomBackground, previewCustomBackground, useStore,
}: AppearanceRowComponentProps) {
  const preference = useStore(s => s.preference)
  const customBackground = useStore(s => s.customBackground)
  const input = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ThemeKey | undefined>()

  const selectImage = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return
    setProcessing(true)
    setError(undefined)
    try {
      setCustomBackground('image', await prepareBackgroundImage(file))
    } catch (cause) {
      const code = cause instanceof BackgroundImageError ? cause.code : 'decode-failed'
      setError(`appearance.background.error.${code}`)
    } finally {
      setProcessing(false)
    }
  }

  const previewStyle = {
    '--theme-background-preview': customBackground.image === ''
      ? 'linear-gradient(145deg, #bfcddc, #efd9cf 52%, #ccd9d3)'
      : `url(${JSON.stringify(customBackground.image)})`,
  } as CSSProperties

  return (
    <div className={css.group}>
      <div className={css.title}>{t('appearance.title')}</div>
      <div className={css.cubeRow}>
        {CUBES.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.themeCube, preference === id && css.selected)}
            aria-pressed={preference === id}
            onClick={() => { setTheme(id) }}
          >
            <Icon />
            {t(labelKey)}
          </button>
        ))}
      </div>
      {preference === 'custom-background' && (
        <div className={css.backgroundEditor}>
          <div className={css.backgroundPreview} style={previewStyle}>
            <div className={css.previewVeil} style={{ opacity: customBackground.overlay / 100 }} />
            <span>{customBackground.image === '' ? t('appearance.background.empty') : t('appearance.background.preview')}</span>
          </div>
          <div className={css.backgroundActions}>
            <input
              ref={input}
              className={css.fileInput}
              type="file"
              accept="image/*"
              onChange={(event) => { void selectImage(event) }}
            />
            <button
              type="button"
              className={css.actionButton}
              disabled={processing}
              onClick={() => { input.current?.click() }}
            >
              {processing ? t('appearance.background.processing') : t('appearance.background.choose')}
            </button>
            {customBackground.image !== '' && (
              <button
                type="button"
                className={clsx(css.actionButton, css.removeButton)}
                onClick={() => { setCustomBackground('image', '') }}
              >
                <IconTrashOutline16 />
                {t('appearance.background.remove')}
              </button>
            )}
          </div>
          {error !== undefined && <div className={css.error} role="alert">{t(error)}</div>}
          <div className={css.controlGrid}>
            <label className={css.control}>
              <span>{t('appearance.background.fit')}</span>
              <select
                value={customBackground.fit}
                onChange={(event) => { setCustomBackground('fit', event.target.value) }}
              >
                <option value="cover">{t('appearance.background.fit.cover')}</option>
                <option value="contain">{t('appearance.background.fit.contain')}</option>
              </select>
            </label>
            <label className={css.control}>
              <span>{t('appearance.background.overlay')} · {customBackground.overlay}%</span>
              <input
                type="range"
                min="0"
                max="70"
                step="1"
                value={customBackground.overlay}
                onChange={(event) => { previewCustomBackground('overlay', Number(event.target.value)) }}
                onPointerUp={(event) => { setCustomBackground('overlay', Number(event.currentTarget.value)) }}
                onKeyUp={(event) => { setCustomBackground('overlay', Number(event.currentTarget.value)) }}
                onBlur={(event) => { setCustomBackground('overlay', Number(event.currentTarget.value)) }}
              />
            </label>
            <label className={css.control}>
              <span>{t('appearance.background.blur')} · {customBackground.blur}px</span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={customBackground.blur}
                onChange={(event) => { previewCustomBackground('blur', Number(event.target.value)) }}
                onPointerUp={(event) => { setCustomBackground('blur', Number(event.currentTarget.value)) }}
                onKeyUp={(event) => { setCustomBackground('blur', Number(event.currentTarget.value)) }}
                onBlur={(event) => { setCustomBackground('blur', Number(event.currentTarget.value)) }}
              />
            </label>
            <label className={css.control}>
              <span>{t('appearance.background.transparency')} · {customBackground.transparency}%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={customBackground.transparency}
                onChange={(event) => { previewCustomBackground('transparency', Number(event.target.value)) }}
                onPointerUp={(event) => { setCustomBackground('transparency', Number(event.currentTarget.value)) }}
                onKeyUp={(event) => { setCustomBackground('transparency', Number(event.currentTarget.value)) }}
                onBlur={(event) => { setCustomBackground('transparency', Number(event.currentTarget.value)) }}
              />
            </label>
            <label className={css.control}>
              <span>{t('appearance.background.windowBlur')} · {customBackground.windowBlur}px</span>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={customBackground.windowBlur}
                onChange={(event) => { previewCustomBackground('windowBlur', Number(event.target.value)) }}
                onPointerUp={(event) => { setCustomBackground('windowBlur', Number(event.currentTarget.value)) }}
                onKeyUp={(event) => { setCustomBackground('windowBlur', Number(event.currentTarget.value)) }}
                onBlur={(event) => { setCustomBackground('windowBlur', Number(event.currentTarget.value)) }}
              />
            </label>
          </div>
          <p className={css.privacyNote}>{t('appearance.background.privacy')}</p>
        </div>
      )}
    </div>
  )
}
