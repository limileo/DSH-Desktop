/** Browser-side normalization for durable custom-background images. */

const MAX_INPUT_BYTES = 40 * 1024 * 1024
const KEEP_ORIGINAL_BYTES = 2 * 1024 * 1024
const MAX_EDGE = 2560

export class BackgroundImageError extends Error {
  readonly code: 'not-image' | 'too-large' | 'decode-failed'

  constructor(code: 'not-image' | 'too-large' | 'decode-failed') {
    super(code)
    this.code = code
  }
}

/**
 * Convert a user-selected image into a durable data URL. Small files retain
 * their original encoding (including GIF animation); large raster images are
 * scaled down and encoded as WebP to keep settings startup lightweight.
 */
export async function prepareBackgroundImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new BackgroundImageError('not-image')
  if (file.size > MAX_INPUT_BYTES) throw new BackgroundImageError('too-large')
  const source = await readDataUrl(file)
  if (file.size <= KEEP_ORIGINAL_BYTES) return source
  try {
    const image = await loadImage(source)
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('2d canvas unavailable')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/webp', 0.86)
  } catch {
    throw new BackgroundImageError('decode-failed')
  }
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new BackgroundImageError('decode-failed'))
    })
    reader.addEventListener('error', () => { reject(new BackgroundImageError('decode-failed')) })
    reader.readAsDataURL(file)
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => { resolve(image) })
    image.addEventListener('error', () => { reject(new Error('image decode failed')) })
    image.src = source
  })
}
