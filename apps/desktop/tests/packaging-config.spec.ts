import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

interface DesktopPackage {
  readonly scripts: Readonly<Record<string, string>>
  readonly build: {
    readonly appId: string
    readonly productName: string
    readonly afterPack: string
    readonly electronDist: string
    readonly extraResources: readonly {
      readonly from: string
      readonly to: string
    }[]
    readonly mac: {
      readonly hardenedRuntime: boolean
      readonly icon: string
      readonly notarize: boolean
    }
    readonly win: { readonly icon: string }
    readonly nsis: {
      readonly allowToChangeInstallationDirectory: boolean
      readonly artifactName: string
      readonly createDesktopShortcut: string
      readonly oneClick: boolean
      readonly perMachine: boolean
      readonly shortcutName: string
    }
  }
}

interface RootPackage {
  readonly scripts: Readonly<Record<string, string>>
}

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(desktopRoot, '../..')
const workspaceConfiguration = readFileSync(resolve(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8')
const builderPatch = readFileSync(resolve(repositoryRoot, 'patches/app-builder-lib@26.15.3.patch'), 'utf8')
const desktopPackage = JSON.parse(
  readFileSync(resolve(desktopRoot, 'package.json'), 'utf8'),
) as DesktopPackage
const desktopMain = readFileSync(resolve(desktopRoot, 'src/main.ts'), 'utf8')
const runtimeStaging = readFileSync(resolve(desktopRoot, 'scripts/stage-runtime.ts'), 'utf8')
const rootPackage = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'),
) as RootPackage

describe('desktop packaging configuration', () => {
  it('uses the community project identity throughout the desktop carrier', () => {
    expect(desktopPackage.build.appId).toBe('io.github.limileo.dsh-desktop')
    expect(desktopPackage.build.productName).toBe('DSH Desktop')
    expect(desktopMain).toContain("const APP_NAME = 'DSH Desktop'")
    expect(desktopMain).toContain("window.on('page-title-updated'")
  })

  it('packages the installed Electron distribution', () => {
    expect(desktopPackage.build.electronDist).toBe('node_modules/electron/dist')
    expect(workspaceConfiguration).toContain("'app-builder-lib@26.15.3>@electron/get': '3.1.0'")
  })

  it('maps the staged Host node_modules directory as the copy root', () => {
    expect(desktopPackage.build.extraResources).toEqual(expect.arrayContaining([
      { from: 'runtime-host/package.json', to: 'host/package.json' },
      { from: 'runtime-host/node_modules', to: 'host/node_modules' },
    ]))
    expect(desktopPackage.build.afterPack).toBe('./scripts/verify-packaged-runtime.ts')
  })

  it('unlocks the temporary signing Keychain with its own password', () => {
    expect(workspaceConfiguration).toContain(
      'app-builder-lib@26.15.3: patches/app-builder-lib@26.15.3.patch',
    )
    expect(builderPatch).toContain('cscPasswords, keychainPassword')
    expect(builderPatch).toContain('"-k", keychainPassword, keychainFile')
  })

  it('keeps the supplied platform icons byte-for-byte', () => {
    const macIcon = readFileSync(resolve(desktopRoot, 'build/icon.icns'))
    const windowsIcon = readFileSync(resolve(desktopRoot, 'build/icon.png'))

    expect(createHash('sha256').update(macIcon).digest('hex'))
      .toBe('579de6fa8c859f7b94a77b4bd610a4b1f70d9d41f65823a9b6bae025a970b75f')
    expect(createHash('sha256').update(windowsIcon).digest('hex'))
      .toBe('e9fa2ac692491c051536fb5d322e7eefe874d3977892e82852295d137bf27d91')
    expect(desktopPackage.build.mac.icon).toBe('build/icon.icns')
    expect(desktopPackage.build.win.icon).toBe('build/icon.png')
  })

  it('builds and stages the complete workspace before local packaging', () => {
    for (const name of ['package', 'package:unsigned', 'dist', 'dist:unsigned']) {
      expect(desktopPackage.scripts[name]).toContain('pnpm --workspace-root run build')
      expect(desktopPackage.scripts[name]).toContain('scripts/stage-runtime.ts')
    }
    expect(desktopPackage.scripts.package).toContain('electron-builder --dir')
    expect(desktopPackage.scripts.package).not.toContain('release-preflight.ts')
    expect(desktopPackage.scripts['package:unsigned']).toContain('scripts/package-unsigned.ts')
    expect(desktopPackage.scripts['dist:unsigned']).toContain('scripts/dist-unsigned.ts')
  })

  it('builds installable certificate-free artifacts for macOS and Windows', () => {
    expect(desktopPackage.build.nsis).toMatchObject({
      allowToChangeInstallationDirectory: true,
      artifactName: 'DSH-Desktop-Windows-${arch}-Setup-${version}.${ext}',
      createDesktopShortcut: 'always',
      oneClick: false,
      perMachine: false,
      shortcutName: 'DSH Desktop',
    })
    expect(rootPackage.scripts['dist:desktop:unsigned'])
      .toBe('pnpm --filter @deepseek-ai/dsh-desktop run dist:unsigned')
    const windowsSmoke = readFileSync(resolve(desktopRoot, 'scripts/smoke-windows-installer.ps1'), 'utf8')
    const unsignedDistribution = readFileSync(resolve(desktopRoot, 'scripts/dist-unsigned.ts'), 'utf8')
    expect(windowsSmoke).toContain('DSH Desktop.exe')
    expect(windowsSmoke).toContain('Invoke-WebRequest')
    expect(unsignedDistribution).toContain('shell: true')
    expect(unsignedDistribution).toContain('node_modules/electron/install.js')
    expect(unsignedDistribution).toContain('Electron distribution is missing after installation')
    expect(unsignedDistribution).toContain("'--publish', 'never'")
    expect(runtimeStaging).toContain("process.platform === 'win32'")
    expect(runtimeStaging).toContain("await run('pnpm'")
  })

  it('makes the macOS DMG path signed, hardened, and notarized', () => {
    const command = desktopPackage.scripts['dist:mac']

    expect(command).toBe('node --import tsx scripts/release-mac.ts')
    expect(desktopPackage.build.mac.hardenedRuntime).toBe(true)
    expect(desktopPackage.build.mac.notarize).toBe(true)
  })

  it('exposes generic and macOS release commands at the repository root', () => {
    expect(rootPackage.scripts['dist:desktop'])
      .toBe('pnpm --filter @deepseek-ai/dsh-desktop run dist')
    expect(rootPackage.scripts['dist:mac:desktop'])
      .toBe('pnpm --filter @deepseek-ai/dsh-desktop run dist:mac')
  })
})
