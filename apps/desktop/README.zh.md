# DSH Desktop 桌面载体

[English](README.md) | 中文

Electron 桌面层负责启动官方 `dsh web`、等待回环地址就绪、创建窗口并通过系统托盘持有 Host 生命周期。关闭窗口只隐藏应用；从托盘退出时会先停止 Host，再结束桌面进程。

## 开发

在仓库根目录运行：

```sh
pnpm install
pnpm run dev:desktop
```

开发命令会构建 Harness Host、客户端包、Web 前端和 Electron main 进程。应用只接受 `127.0.0.1` 或 `localhost` 的 HTTP 就绪地址，阻止窗口导航到其他来源，并把外部 HTTP/HTTPS 链接交给系统浏览器。

macOS 使用内嵌标题栏、交通灯与侧栏 vibrancy；Windows 保留系统边框、阴影、缩放和 Snap，并使用 Windows 11 圆角与 acrylic 背景。应用名、窗口标题、安装目录与快捷方式统一为 `DSH Desktop`。

## 本地打包

生成当前平台的未封装应用：

```sh
pnpm run package:desktop:unsigned
```

生成当前平台可安装的无证书发行包：

```sh
pnpm run dist:desktop:unsigned
```

- macOS：生成 `DSH-Desktop-macOS-<arch>-<version>.dmg`，DMG 内包含应用和指向 `/Applications` 的快捷入口。
- Windows：生成 `DSH-Desktop-Windows-<arch>-Setup-<version>.exe`，使用 NSIS 安装向导，可选择安装目录，并创建桌面与开始菜单快捷方式。

构建会先完成整个仓库、暂存 Host 的生产依赖树，再由 `afterPack` 检查已打包 CLI 与 Web UI 入口。macOS 无证书构建使用 ad-hoc 完整性封印；Windows 无证书构建会显示未知发布者。这些构建不依赖应用商店，但操作系统仍可能在首次运行时提示用户确认。

Windows CI 不是只验证文件存在：`scripts/smoke-windows-installer.ps1` 会静默安装 Setup、启动已安装的应用，并确认内置 Web Host 在回环地址返回前端页面。macOS 发布验证会挂载 DMG、复制应用、校验封印并实际启动。

## 已签名 macOS 发布

若拥有 `Developer ID Application` 证书和 Apple 公证凭据，可运行：

```sh
APPLE_KEYCHAIN_PROFILE=dsh-notary pnpm run dist:mac:desktop
```

也可使用完整 Apple ID 凭据组，或 App Store Connect API 密钥组。`scripts/release-preflight.ts` 会在耗时构建前检查签名身份与公证凭据，`scripts/release-mac.ts` 只把秘密传给 Electron Builder 阶段。证书、密码与环境文件不得提交到仓库。

公开发布的 macOS DMG 使用 Developer ID 签名并启用 Hardened Runtime，已经通过 Apple 公证并装订公证票据。上传前使用 `codesign --verify --deep --strict`、`xcrun stapler validate` 与 `spctl --assess --type execute` 完成发行验证。

## 自动吸收上游更新

`.github/workflows/desktop-portable.yml` 在 macOS 和 Windows 原生 Runner 上执行安装包构建。定时或手动运行时会先在临时检出中合并官方 `deepseek-ai/deepseek-harness` 的最新 `master`。可干净合并的版本继续测试；冲突或安装启动失败都会中止构建。

当前桌面应用不包含后台自更新器，因此新版本通过 GitHub Releases 分发，由用户下载安装。
