/** Build a certificate-free unpacked desktop application for the current platform. */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const desktopRoot = resolve(import.meta.dirname, '..')
const desktopManifest = JSON.parse(readFileSync(join(desktopRoot, 'package.json'), 'utf8')) as {
  readonly build: { readonly productName: string }
}

function run(command: string, args: readonly string[], env: NodeJS.ProcessEnv = process.env): void {
  const result = spawnSync(command, args, { cwd: desktopRoot, env, stdio: 'inherit' })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${String(result.status)}`)
}

function macApplicationPath(): string {
  const outputDirectory = process.arch === 'arm64' ? 'mac-arm64' : 'mac'
  return join(desktopRoot, 'dist', outputDirectory, `${desktopManifest.build.productName}.app`)
}

/** Package without Developer ID discovery, then add a local integrity seal on macOS. */
function packageUnsigned(): void {
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  const builderArgs = ['exec', 'electron-builder', '--dir', '--publish', 'never']
  if (process.platform === 'darwin') builderArgs.push('--config.mac.notarize=false')

  run(pnpm, builderArgs, {
    ...process.env,
    CSC_IDENTITY_AUTO_DISCOVERY: 'false',
  })

  if (process.platform !== 'darwin') return
  const application = macApplicationPath()
  if (!existsSync(application)) throw new Error(`packaged macOS application is missing: ${application}`)

  // Electron arrives signed upstream. Repackaging invalidates that outer seal, so
  // replace it with an ad-hoc seal that needs no certificate or Apple account.
  run('codesign', ['--force', '--deep', '--sign', '-', application])
  run('codesign', ['--verify', '--deep', '--strict', application])
}

try {
  packageUnsigned()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
