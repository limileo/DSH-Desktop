/** Build a certificate-free installer for the current desktop platform. */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { detachMacVolume } from './detach-mac-volume.ts'

interface DesktopManifest {
  readonly version: string
  readonly build: { readonly productName: string }
}

const desktopRoot = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(join(desktopRoot, 'package.json'), 'utf8')) as DesktopManifest
const distDirectory = join(desktopRoot, 'dist')

function run(
  command: string,
  args: readonly string[],
  options: { readonly env?: NodeJS.ProcessEnv; readonly capture?: boolean; readonly shell?: boolean } = {},
): string {
  const result = spawnSync(command, args, {
    cwd: desktopRoot,
    env: options.env ?? process.env,
    encoding: options.capture === true ? 'utf8' : undefined,
    stdio: options.capture === true ? 'pipe' : 'inherit',
    shell: options.shell ?? false,
  })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${String(result.status)}`)
  return options.capture === true ? String(result.stdout) : ''
}

function macApplicationPath(): string {
  const outputDirectory = process.arch === 'arm64' ? 'mac-arm64' : 'mac'
  return join(distDirectory, outputDirectory, `${manifest.build.productName}.app`)
}

function ensureElectronDistribution(): void {
  const electronDistribution = join(desktopRoot, 'node_modules/electron/dist')
  if (!existsSync(electronDistribution)) {
    const electronInstaller = join(desktopRoot, 'node_modules/electron/install.js')
    if (!existsSync(electronInstaller)) {
      throw new Error(`Electron installer is missing: ${electronInstaller}`)
    }
    run(process.execPath, [electronInstaller])
  }
  if (!existsSync(electronDistribution)) {
    throw new Error(`Electron distribution is missing after installation: ${electronDistribution}`)
  }
}

function mountedVolume(output: string): string {
  const match = output.match(/\t(\/Volumes\/[^\n]+)\s*$/m)
  if (match?.[1] === undefined) throw new Error(`hdiutil did not report a mounted volume:\n${output}`)
  return match[1]
}

function createMacDmg(): void {
  ensureElectronDistribution()
  run('node', ['--import', 'tsx', 'scripts/package-unsigned.ts'])
  const application = macApplicationPath()
  if (!existsSync(application)) throw new Error(`packaged macOS application is missing: ${application}`)

  const artifact = join(
    distDirectory,
    `DSH-Desktop-macOS-${process.arch}-${manifest.version}.dmg`,
  )
  const writableImage = join(distDirectory, `.DSH-Desktop-${process.pid}.dmg`)
  rmSync(artifact, { force: true })
  rmSync(writableImage, { force: true })

  const diskKilobytes = Number.parseInt(run('du', ['-sk', application], { capture: true }), 10)
  if (!Number.isFinite(diskKilobytes) || diskKilobytes < 1) {
    throw new Error(`could not measure packaged macOS application: ${application}`)
  }
  const imageMegabytes = Math.ceil(diskKilobytes / 1024 * 1.25) + 96
  run('hdiutil', [
    'create', '-ov', '-size', `${imageMegabytes}m`, '-fs', 'HFS+',
    '-volname', manifest.build.productName, writableImage,
  ])

  let volume: string | undefined
  try {
    volume = mountedVolume(run('hdiutil', [
      'attach', '-nobrowse', '-noverify', '-noautoopen', writableImage,
    ], { capture: true }))
    run('ditto', [application, join(volume, `${manifest.build.productName}.app`)])
    run('ln', ['-s', '/Applications', join(volume, 'Applications')])
    run('sync', [])
  } finally {
    if (volume !== undefined) {
      detachMacVolume(volume, { run: (args) => { run('hdiutil', args) } })
    }
  }

  run('hdiutil', [
    'convert', writableImage, '-ov', '-format', 'UDZO',
    '-imagekey', 'zlib-level=9', '-o', artifact,
  ])
  rmSync(writableImage, { force: true })
  run('hdiutil', ['verify', artifact])
  console.log(`unsigned macOS installer created at ${artifact}`)
}

function createWindowsInstaller(): void {
  ensureElectronDistribution()
  run('pnpm', ['exec', 'electron-builder', '--win', 'nsis', '--publish', 'never'], {
    env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' },
    shell: true,
  })
}

function distUnsigned(): void {
  if (process.platform === 'darwin') {
    createMacDmg()
    return
  }
  if (process.platform === 'win32') {
    createWindowsInstaller()
    return
  }
  throw new Error(`unsigned installer packaging is unsupported on ${process.platform}`)
}

try {
  distUnsigned()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
