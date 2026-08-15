# Agent Note: Built-in Light texture presentation theme

Status: implemented

English | [中文](2026-08-15-light-texture-theme.zh.md)

## Problem

The desktop distribution needed a second optional presentation theme based on the reference's soft, tactile spatial language. A palette-only swap would miss the defining component treatment: floating shells, rounded cards, milky translucency, pill controls, quiet borders, layered highlights, and generous spacing.

## Decision

`light-texture` is a built-in persisted light theme and appears as **Light texture** (Chinese: **轻质感**) in Settings > General > Appearance. `ui-theme/styles/light-texture.css` owns a CSS-only ambient backdrop plus scoped palette and material tokens. Layout, sidebar, workspace rows, conversation, composer, settings, buttons, inputs, and the theme picker consume geometry, border, shadow, and backdrop tokens with original-theme fallbacks.

The theme uses no reference artwork or external asset. It changes presentation only; routing, tools, permissions, settings, and official DeepSeek Harness behavior remain unchanged.

## Verification

GUI tests cover registration, selection, persistence, synchronous boot, scoped styles, component-token consumers, and the no-external-asset boundary. The web end-to-end settings scenario clicks `轻质感`, checks `data-ds-theme="light-texture"`, and verifies `settings.yaml` stores `preference: light-texture`.
