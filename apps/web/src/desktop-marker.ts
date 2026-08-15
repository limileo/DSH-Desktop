const DESKTOP_PLATFORMS = new Set(['darwin', 'win32', 'linux'])

/**
 * Apply the presentation-only Electron marker before the client tree mounts.
 * @param locationHref - renderer document URL supplied by the desktop shell.
 * @param root - document root that owns platform presentation selectors.
 */
export function applyDesktopPresentationMarker(locationHref: string, root: HTMLElement): void {
  const platform = new URL(locationHref).searchParams.get('dsh-desktop-platform')
  if (platform === null || !DESKTOP_PLATFORMS.has(platform)) return
  root.dataset.dshDesktop = 'true'
  root.dataset.dshDesktopPlatform = platform
}
