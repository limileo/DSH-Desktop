# Agent Note: Built-in Soft chat presentation theme

Status: implemented

English | [中文](2026-08-15-wechat-theme.zh.md)

## Problem

The desktop distribution needed an optional familiar, chat-oriented visual treatment while preserving the official DeepSeek Harness interaction model, settings persistence, and existing light/dark/system themes. A page-specific restyle would bypass the theme runtime, flash during boot, and scatter literal colors across feature packages.

## Decision

`wechat` is a fourth built-in persisted theme preference and remains its stable compatibility id, while the user-facing name is **Soft chat** (Chinese: **微语主题**). It resolves as a light color scheme and is identified on the document by `body[data-ds-theme='wechat']` during both synchronous boot and live theme presentation. `ui-theme/styles/wechat.css` owns the scoped palette and semantic component tokens. Feature styles only consume those tokens, with existing values as fallbacks, for the sidebar selection, new-session action, conversation surface, message bubbles, and composer.

The theme is inspired by WeChat's desktop information hierarchy and green chat palette, but it copies no logo, icon set, avatar, screenshot, or other brand asset. It changes presentation only; routing, conversations, tools, permissions, and host behavior remain official DeepSeek Harness behavior. Users select it from Settings > General > Appearance, and the Host settings provider persists it like the other built-ins.

## Verification

GUI tests cover built-in registration, selection, persistence, boot attributes, presenter disposal, and stylesheet scoping. The web end-to-end settings scenario clicks the Chinese `微语主题` control, checks `data-ds-theme="wechat"`, and verifies `settings.yaml` stores `preference: wechat`.
