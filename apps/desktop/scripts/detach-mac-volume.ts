/** Reliably detach a temporary macOS disk image volume in local and CI builds. */

export interface DetachMacVolumeOptions {
  readonly run: (args: readonly string[]) => void
  readonly wait?: (milliseconds: number) => void
  readonly warn?: (message: string) => void
  readonly attempts?: number
  readonly retryDelayMilliseconds?: number
}

function blockingWait(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)
}

/** Retry a normal detach before using hdiutil's force fallback. */
export function detachMacVolume(volume: string, options: DetachMacVolumeOptions): void {
  const attempts = options.attempts ?? 3
  const retryDelayMilliseconds = options.retryDelayMilliseconds ?? 1_000
  const wait = options.wait ?? blockingWait
  const warn = options.warn ?? console.warn
  let lastFailure: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      options.run(['detach', volume])
      return
    } catch (error) {
      lastFailure = error
      if (attempt < attempts) wait(retryDelayMilliseconds)
    }
  }

  warn(`normal detach failed after ${String(attempts)} attempts; forcing ${volume}: ${String(lastFailure)}`)
  options.run(['detach', '-force', volume])
}
