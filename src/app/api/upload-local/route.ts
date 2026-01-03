import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

/**
 * API Route for local file upload during development
 * Saves files to public/uploads directory
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file ricevuto' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filename = file.name || `foto-${Date.now()}.jpg`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/${filename}`

    console.log('✅ Foto salvata localmente:', url)

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('❌ Errore upload locale:', error)
    return NextResponse.json(
      { error: 'Errore durante il salvataggio del file' },
      { status: 500 }
    )
  }
}
