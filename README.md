# DSH Desktop

English | [中文](README.zh.md)

A ready-to-use desktop edition of the official [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Install and launch it without separately installing Node.js, running commands, or configuring a runtime.

> DSH Desktop is an unofficial community project. It is not an official DeepSeek product or distribution channel.

## Download and install

Download the latest version from this repository's [GitHub Releases](https://github.com/limileo/DSH-Desktop/releases).

| Platform | Installer | Availability |
| --- | --- | --- |
| macOS Apple Silicon | `DSH-Desktop-macOS-arm64-*.dmg` | Supported |
| Windows x64 | `DSH-Desktop-Windows-x64-Setup-*.exe` | Supported |
| macOS Intel | — | Planned |

On macOS, open the DMG and drag `DSH Desktop` to `Applications`. The community build is not signed with an Apple Developer ID; if Gatekeeper blocks the first launch, right-click the app in Finder and choose **Open**.

On Windows, run the Setup executable and follow the installer. The community build does not use a purchased code-signing certificate, so SmartScreen may show an unknown-publisher warning; choose **More info** to continue.

These are operating-system signing warnings. The installer still contains the complete runtime and does not require separate dependencies.

## Preview

<p align="center">
  <img src="assets/dsh-desktop-preview.png" alt="DSH Desktop preview" width="100%">
</p>

## Desktop features

- Bundles the official Harness Host, Web UI, and runtime dependencies
- Starts and supervises the local Host without a command line
- Keeps the Host alive in the system tray when the window is closed
- Keeps sessions and services local
- Opens external pages in the system browser and restricts in-app navigation
- Includes native, dark, Soft Chat, and Light Texture themes
- Adapts window chrome, rounded surfaces, and sidebar layout for macOS and Windows
- Validates both the macOS DMG and Windows NSIS installer through real install-and-launch smoke tests

## Relationship to the official project

Harness core behavior, plugins, agent capabilities, and the Web UI come from [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness). This repository maintains the desktop carrier, theme adaptations, installers, and cross-platform validation on top of that source.

`.github/workflows/desktop-portable.yml` builds installers on native macOS and Windows runners. Scheduled and manual builds first attempt to merge the official `master`; conflicts fail explicitly instead of distributing an unverified automatic merge.

Installed applications do not currently replace their own program files in the background. New versions are published through GitHub Releases for users to install when desired. This avoids app-store distribution but does not bypass macOS or Windows security requirements for unsigned software.

## Development

Node.js 22.23.2 and pnpm are required. The desktop entry lives in `apps/desktop`.

```sh
pnpm install
pnpm run dev:desktop
```

Build the unsigned installer for the current operating system:

```sh
pnpm run dist:desktop:unsigned
```

This creates a DMG on macOS and an NSIS Setup EXE on Windows. See [`apps/desktop/README.md`](apps/desktop/README.md) for architecture and signed-release details.

## Contributing

Use [Issues](https://github.com/limileo/DSH-Desktop/issues) for desktop-specific problems and Pull Requests for improvements. For Harness core behavior and plugin development, also consult the official project's contribution guide.

## License

[MIT](LICENSE). The original copyright notice remains intact; see [NOTICE](NOTICE) for the desktop modifications. Third-party dependency notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
