# Agent Note：内置轻质感展示主题

状态：已实现

[English](2026-08-15-light-texture-theme.md) | 中文

## 问题

桌面发行版需要第二个可选展示主题，借鉴参考图柔和、有触感的空间语言。只替换配色无法呈现其核心组件特征：浮动外壳、大圆角卡片、乳白半透明材质、胶囊控件、低对比边框、叠层高光和舒展间距。

## 决策

`light-texture` 是可持久化的内置浅色主题，在“设置 > 通用设置 > 外观”中显示为“轻质感”。`ui-theme/styles/light-texture.css` 统一拥有纯 CSS 环境背景、作用域配色和材质 token；布局、侧栏、工作区列表、会话、输入区、设置面板、按钮、输入控件和主题选择器消费几何、边框、阴影与背景模糊 token，并以原主题值兜底。

该主题不使用参考图素材或外部资源，只改变展示；路由、工具、权限、设置与 DeepSeek Harness 官方行为保持不变。

## 验证

GUI 测试覆盖注册、选择、持久化、同步启动、作用域样式、组件 token 消费方和无外部素材边界。Web 端到端设置场景会真实点击“轻质感”，检查 `data-ds-theme="light-texture"`，并验证 `settings.yaml` 写入 `preference: light-texture`。
