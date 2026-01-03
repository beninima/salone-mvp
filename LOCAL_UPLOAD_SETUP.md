# Sistema Upload Locale per Sviluppo

## Problema Risolto

Durante lo sviluppo locale, l'upload delle foto falliva perché il progetto usa **Vercel Blob** in produzione, ma richiede un token `BLOB_READ_WRITE_TOKEN` che non è configurato in locale.

## Soluzione Implementata

Sistema **dual-mode** che usa:
- **Sviluppo locale**: salvataggio su filesystem (`public/uploads/`)
- **Produzione Vercel**: upload su Vercel Blob Storage

## File Modificati

### 1. `src/lib/upload.ts`
Aggiunto controllo per ambiente locale:

```typescript
export async function uploadToBlob(file: File | Blob, filename?: string): Promise<string> {
  const actualFilename = filename || `foto-${Date.now()}.jpg`

  // LOCAL DEV MODE: save to public/uploads instead of Vercel Blob
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const formData = new FormData()
    formData.append('file', file, actualFilename)

    const response = await fetch('/api/upload-local', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return data.url  // "/uploads/foto-123.jpg"
  }

  // PRODUCTION MODE: use Vercel Blob
  const blob = await put(actualFilename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return blob.url  // "https://xxx.public.blob.vercel-storage.com/foto-123.jpg"
}
```

### 2. `src/app/api/upload-local/route.ts` (NUOVO)
API Route per salvare file localmente:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filename = file.name || `foto-${Date.now()}.jpg`
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, buffer)

  const url = `/uploads/${filename}`
  return NextResponse.json({ url, filename })
}
```

### 3. `.gitignore`
Aggiunto per evitare di committare foto di test:

```
# local uploads (dev mode)
/public/uploads/
```

## Come Funziona

### Sviluppo Locale (senza BLOB_READ_WRITE_TOKEN)

1. User scatta foto con camera o seleziona da galleria
2. `CameraUploader.tsx` converte foto in File object
3. `NuovoLavoroModal.tsx` chiama `compressImage()` → `uploadToBlob()`
4. `uploadToBlob()` rileva assenza token → chiama `/api/upload-local`
5. API salva file in `public/uploads/foto-123.jpg`
6. Ritorna URL locale: `/uploads/foto-123.jpg`
7. URL salvato nel database Prisma
8. Next.js serve le foto da `public/uploads/` automaticamente

### Produzione Vercel (con BLOB_READ_WRITE_TOKEN)

1. Steps 1-3 uguali
2. `uploadToBlob()` rileva token presente → usa Vercel Blob SDK
3. Upload su `https://xxx.public.blob.vercel-storage.com/`
4. Ritorna URL remoto
5. URL salvato nel database

## Struttura Directory

```
salone-mvp/
├── public/
│   └── uploads/              # ← File locali (gitignored)
│       ├── foto-1234.jpg
│       └── foto-5678.jpg
├── src/
│   ├── app/
│   │   └── api/
│   │       └── upload-local/
│   │           └── route.ts  # ← API upload locale
│   └── lib/
│       └── upload.ts         # ← Logica dual-mode
└── .env
    └── BLOB_READ_WRITE_TOKEN=xxx  # ← Solo in produzione
```

## Test

```bash
# Test API upload locale
curl -X POST http://localhost:3000/api/upload-local \
  -F "file=@test.jpg"

# Response
{"url":"/uploads/test.jpg","filename":"test.jpg"}

# Verifica file salvato
ls -lh public/uploads/
```

## Vantaggi

✅ **Zero configurazione** in sviluppo locale (no token needed)  
✅ **Stesso codice** funziona in dev e prod  
✅ **File locali** accessibili immediatamente via browser  
✅ **Gitignore** previene commit di foto di test  
✅ **Auto-switch** basato su presenza variabile ambiente  

## Deploy Vercel

Per produzione, aggiungi variabile ambiente:

```bash
# Vercel Dashboard → Settings → Environment Variables
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

Il sistema **automaticamente** userà Vercel Blob invece del filesystem.

## Note Tecniche

- Filesystem upload usa Node.js `fs/promises` (solo server-side)
- Blob upload usa `@vercel/blob` SDK (client-safe)
- Le foto locali sono in `public/` quindi servite da Next.js automaticamente
- In produzione, `public/uploads/` non esiste (tutto su Vercel Blob)
