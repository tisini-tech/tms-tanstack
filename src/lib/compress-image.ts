const MAX_BYTES = 1024 * 1024 // 1 MB
const MAX_DIMENSION = 1920

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
      type,
      quality,
    )
  })
}

/**
 * Compress an image File to at most `maxBytes` (default 1 MB).
 * Scales down large dimensions, then lowers JPEG/WebP quality until it fits.
 */
export async function compressImage(
  file: File,
  maxBytes = MAX_BYTES,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= maxBytes) {
    return file
  }

  const img = await loadImage(file)
  let { width, height } = img

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
  width = Math.round(width * scale)
  height = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, width, height)

  const outputType =
    file.type === 'image/png' || file.type === 'image/webp'
      ? 'image/webp'
      : 'image/jpeg'
  const ext = outputType === 'image/webp' ? 'webp' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'

  let quality = 0.9
  let blob = await canvasToBlob(canvas, outputType, quality)

  while (blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1
    blob = await canvasToBlob(canvas, outputType, quality)
  }

  // Still too large — shrink dimensions further
  while (blob.size > maxBytes && width > 400) {
    width = Math.round(width * 0.8)
    height = Math.round(height * 0.8)
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    blob = await canvasToBlob(canvas, outputType, quality)
  }

  return new File([blob], `${baseName}.${ext}`, {
    type: outputType,
    lastModified: Date.now(),
  })
}
