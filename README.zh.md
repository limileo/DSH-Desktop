<div align="center">

# DSH Desktop

**基于官方 DeepSeek Harness 的开箱即用桌面版本。**

无需安装 Node.js，无需命令行，无需手动配置运行环境。

[English](README.md) | 中文

[![桌面安装包](https://github.com/limileo/DSH-Desktop/actions/workflows/desktop-portable.yml/badge.svg)](https://github.com/limileo/DSH-Desktop/actions/workflows/desktop-portable.yml) [![最新版本](https://img.shields.io/github/v/release/limileo/DSH-Desktop?display_name=release&sort=semver)](https://github.com/limileo/DSH-Desktop/releases) [![许可证](https://img.shields.io/github/license/limileo/DSH-Desktop)](LICENSE)

</div>

DSH Desktop 将官方 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Host、Web UI 和完整运行环境封装为 macOS 与 Windows 桌面应用。下载安装后直接打开即可使用。

> DSH Desktop 是非官方社区项目，不代表 DeepSeek 官方产品或发布渠道。

## 下载

| 平台 | 安装包 | 说明 |
| --- | --- | --- |
| macOS Apple Silicon | [**下载 DMG**](https://github.com/limileo/DSH-Desktop/releases/latest/download/DSH-Desktop-macOS.dmg) | 已完成 Apple 签名与公证 |
| Windows x64 | [**下载 EXE**](https://github.com/limileo/DSH-Desktop/releases/latest/download/DSH-Desktop-Windows.exe) | 标准 NSIS 安装程序 |

两个安装包都内置完整运行环境，用户不需要另外安装 Node.js、pnpm 或任何命令行工具。

Windows 安装包目前尚未购买代码签名证书，Microsoft Defender SmartScreen 可能显示未知发布者提示，可选择 **更多信息 → 仍要运行**。

## 界面预览

<p align="center">
  <img src="assets/screenshots/default.png" alt="DSH Desktop 默认主题" width="100%">
</p>

## 主要特性

- 打开桌面应用即可启动，无需配置开发环境
- 内置官方 Harness Host、Web UI 与完整运行依赖
- 原生窗口生命周期与系统托盘 Host 管理
- 会话数据和服务保留在本地运行
- macOS 启用 Developer ID、Hardened Runtime、Apple 公证与票据装订
- macOS DMG 与 Windows NSIS 安装包均通过真实安装启动验证
- 提供默认、深色、微语和轻质感主题
- 支持任意本地图片作为背景，可分别调整填充、遮罩、图片模糊、窗口透明度和窗口模糊度
- 修复侧栏折叠、设置弹窗、历史会话切换和持续状态等桌面 UI 问题
- 定期检查官方上游更新，并生成可审查的同步变更

## 主题展示

### 微语与轻质感

<table>
  <tr>
    <td width="50%"><img src="assets/screenshots/soft-chat.png" alt="微语主题"></td>
    <td width="50%"><img src="assets/screenshots/light-texture.png" alt="轻质感主题"></td>
  </tr>
  <tr>
    <td align="center"><strong>微语主题</strong></td>
    <td align="center"><strong>轻质感主题</strong></td>
  </tr>
</table>

### 自定义背景

可以选择任意本地图片作为应用背景，同时独立控制图片和界面表面的显示效果。

<p align="center">
  <img src="assets/screenshots/custom-background.png" alt="自定义图片背景" width="100%">
</p>

所选图片只保存在本机，主题功能不会上传图片。

<p align="center">
  <img src="assets/screenshots/theme-settings.png" alt="主题与自定义背景设置" width="100%">
</p>

## 安装方法

### macOS

1. 下载 `DSH-Desktop-macOS.dmg`。
2. 打开 DMG。
3. 将 **DSH Desktop** 拖入 **Applications**。
4. 从应用程序目录打开 DSH Desktop。

发布的 DMG 和应用本体均使用 Developer ID Application 证书签名，通过 Apple 公证并装订公证票据。

### Windows

1. 下载 `DSH-Desktop-Windows.exe`。
2. 运行安装程序并选择安装目录。
3. 从开始菜单或桌面快捷方式启动 DSH Desktop。

## 与官方项目的关系

Harness 核心行为、插件系统、Agent 能力和 Web UI 来自 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。本仓库在官方源码之上维护桌面载体、平台集成、主题适配、安装包与跨平台验证。

桌面应用不会在后台静默替换自身程序文件。新安装包通过 [GitHub Releases](https://github.com/limileo/DSH-Desktop/releases) 发布；上游同步工作流会先将官方变更变成可审查内容，再进入桌面发行版本。

## 从源码开发

开发环境需要 Node.js 22.23.2 与 pnpm，桌面入口位于 `apps/desktop`。

```sh
pnpm install
pnpm run dev:desktop
```

生成当前操作系统的未签名安装包：

```sh
pnpm run dist:desktop:unsigned
```

桌面架构、打包、签名和发布说明见 [`apps/desktop/README.md`](apps/desktop/README.md)。

## 参与贡献

欢迎通过 [Issues](https://github.com/limileo/DSH-Desktop/issues) 报告桌面端问题，并通过 Pull Request 提交改进。Harness 核心问题与插件开发请同时参考官方项目。

## 许可证

[MIT](LICENSE)。原项目版权声明继续保留，桌面端修改说明见 [NOTICE](NOTICE)，第三方依赖信息见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
