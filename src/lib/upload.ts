import { put } from '@vercel/blob'

/**
 * Upload a file to Vercel Blob storage or local filesystem (dev mode)
 * @param file File or Blob to upload
 * @param filename Custom filename (optional)
 * @returns Blob URL or local URL
 */
export async function uploadToBlob(file: File | Blob, filename?: string): Promise<string> {
  const actualFilename = filename || `foto-${Date.now()}.jpg`

  // LOCAL DEV MODE: save to public/uploads instead of Vercel Blob
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const formData = new FormData()
      formData.append('file', file, actualFilename)

      const response = await fetch('/api/upload-local', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload locale fallito')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('❌ Errore upload locale:', error)
      throw new Error('Errore durante l\'upload della foto')
    }
  }

  // PRODUCTION MODE: use Vercel Blob
  try {
    const blob = await put(actualFilename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return blob.url
  } catch (error) {
    console.error('❌ Errore upload Vercel Blob:', error)
    throw new Error('Errore durante l\'upload della foto')
  }
}

/**
 * Convert base64 data URL to Blob
 * @param dataUrl Base64 data URL (from camera)
 * @returns Blob object
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Compress image before upload
 * @param file File to compress
 * @param maxWidth Max width in pixels (default 1200)
 * @param quality JPEG quality 0-1 (default 0.85)
 * @returns Compressed Blob
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1200,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Scale down if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas to Blob failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Image load failed'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}
