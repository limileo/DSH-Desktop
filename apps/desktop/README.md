# DSH Desktop carrier

English | [中文](README.zh.md)

The Electron layer starts the official `dsh web` Host, waits for its loopback readiness URL, creates the desktop window, and owns the Host lifecycle from the system tray. Closing the window hides it; quitting from the tray stops the Host before terminating the desktop process.

## Development

Run from the repository root:

```sh
pnpm install
pnpm run dev:desktop
```

The development command builds the Harness Host, client packages, Web frontend, and Electron main process. The carrier accepts only HTTP readiness URLs for `127.0.0.1` or `localhost`, blocks navigation to other origins, and delegates external HTTP/HTTPS links to the system browser.

macOS uses an inset title bar, traffic lights, and sidebar vibrancy. Windows keeps the system frame, shadow, resize and Snap behavior while applying Windows 11 rounded corners and acrylic. The product, window, install directory, and shortcut name are consistently `DSH Desktop`.

## Local packaging

Create an unpacked application for the current platform:

```sh
pnpm run package:desktop:unsigned
```

Create an installable certificate-free distribution for the current platform:

```sh
pnpm run dist:desktop:unsigned
```

- macOS produces `DSH-Desktop-macOS-<arch>-<version>.dmg`, containing the application and an `/Applications` shortcut.
- Windows produces `DSH-Desktop-Windows-<arch>-Setup-<version>.exe`, an assisted NSIS installer with a selectable install directory plus desktop and Start Menu shortcuts.

Packaging first builds the complete repository and stages the Host's production dependency closure. The `afterPack` hook then rejects packages missing the CLI or Web UI entrypoint. Certificate-free macOS builds receive an ad-hoc integrity seal; certificate-free Windows builds have an unknown publisher. Neither requires an app store, but the operating system may still request confirmation on first launch.

Windows CI validates more than file existence: `scripts/smoke-windows-installer.ps1` silently installs the Setup package, starts the installed application, and confirms that the bundled Web Host serves the frontend over loopback. macOS release validation mounts the DMG, copies the application, verifies its seal, and launches it.

## Signed macOS release

With a `Developer ID Application` certificate and Apple notarization credentials, run:

```sh
APPLE_KEYCHAIN_PROFILE=dsh-notary pnpm run dist:mac:desktop
```

A complete Apple ID credential group or an App Store Connect API key group is also accepted. `scripts/release-preflight.ts` validates signing identity and notarization credentials before the expensive build. `scripts/release-mac.ts` passes secrets only to the Electron Builder phase. Certificates, passwords, and environment files must never be committed.

## Upstream synchronization

`.github/workflows/desktop-portable.yml` builds installers on native macOS and Windows runners. Scheduled and manual runs first merge the latest official `deepseek-ai/deepseek-harness` `master` in a temporary checkout. Clean merges continue through validation; conflicts or failed install-and-launch checks stop the build.

The desktop app does not currently contain a background self-updater. Unsigned macOS apps cannot reliably replace themselves silently, so new versions are distributed through GitHub Releases for users to install.
