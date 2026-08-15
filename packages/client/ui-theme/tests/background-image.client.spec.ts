// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { prepareBackgroundImage } from '../src/client/background-image.ts'

describe('prepareBackgroundImage', () => {
  it('keeps a small local image self-contained as a data URL', async () => {
    const file = new File(['png'], 'background.png', { type: 'image/png' })
    await expect(prepareBackgroundImage(file)).resolves.toBe('data:image/png;base64,cG5n')
  })

  it('rejects non-images and oversized inputs before decoding', async () => {
    const text = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    await expect(prepareBackgroundImage(text)).rejects.toMatchObject({ code: 'not-image' })
    const huge = new File(['x'], 'huge.png', { type: 'image/png' })
    Object.defineProperty(huge, 'size', { value: 40 * 1024 * 1024 + 1 })
    await expect(prepareBackgroundImage(huge)).rejects.toMatchObject({ code: 'too-large' })
  })
})
