/** `settings.theme` namespace dictionaries (the Appearance row's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'appearance.title': '外观',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'appearance.wechat': '微语主题',
  'appearance.lightTexture': '轻质感',
  'appearance.customBackground': '自定义背景',
  'appearance.background.empty': '选择一张图片作为背景',
  'appearance.background.preview': '背景预览',
  'appearance.background.choose': '选择图片',
  'appearance.background.processing': '正在处理…',
  'appearance.background.remove': '移除图片',
  'appearance.background.fit': '填充方式',
  'appearance.background.fit.cover': '铺满窗口',
  'appearance.background.fit.contain': '完整显示',
  'appearance.background.overlay': '遮罩强度',
  'appearance.background.blur': '模糊程度',
  'appearance.background.transparency': '窗口透明度',
  'appearance.background.windowBlur': '窗口模糊度',
  'appearance.background.privacy': '图片只保存在本机，不会上传。大图会自动优化以保持启动流畅。',
  'appearance.background.error.not-image': '请选择有效的图片文件。',
  'appearance.background.error.too-large': '图片超过 40 MB，请选择较小的文件。',
  'appearance.background.error.decode-failed': '无法读取这张图片，请尝试 JPG、PNG、WebP 或 GIF。',
} satisfies Record<string, string>

/** The settings.theme namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'appearance.wechat': 'Soft chat',
  'appearance.lightTexture': 'Light texture',
  'appearance.customBackground': 'Custom background',
  'appearance.background.empty': 'Choose an image for the background',
  'appearance.background.preview': 'Background preview',
  'appearance.background.choose': 'Choose image',
  'appearance.background.processing': 'Processing…',
  'appearance.background.remove': 'Remove image',
  'appearance.background.fit': 'Image fit',
  'appearance.background.fit.cover': 'Fill window',
  'appearance.background.fit.contain': 'Show full image',
  'appearance.background.overlay': 'Overlay',
  'appearance.background.blur': 'Blur',
  'appearance.background.transparency': 'Window transparency',
  'appearance.background.windowBlur': 'Window blur',
  'appearance.background.privacy': 'The image stays on this device and is never uploaded. Large images are optimized for fast startup.',
  'appearance.background.error.not-image': 'Choose a valid image file.',
  'appearance.background.error.too-large': 'The image is larger than 40 MB. Choose a smaller file.',
  'appearance.background.error.decode-failed': 'This image could not be read. Try JPG, PNG, WebP, or GIF.',
} satisfies Record<ThemeKey, string>
