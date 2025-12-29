# 📸 Galleria Foto Lavori - Setup Completo

Sistema completo di galleria fotografica "Prima/Dopo" per i lavori dei clienti del salone.

## ✅ Installato

- **Database**: Modelli `FotoLavoro` e `Foto` con relazioni
- **Migration**: `20251229130315_add_foto_lavoro` applicata
- **Dipendenze**: `@vercel/blob`, `react-webcam`
- **Componenti**: CameraUploader, FotoGrid, NuovoLavoroModal, LavoroCard
- **Server Actions**: CRUD completo per foto lavori
- **Upload**: Compressione automatica immagini + Vercel Blob

## 🎯 Funzionalità

### Pagina Cliente Dettaglio
- Navigazione: Lista clienti → Click cliente o bottone "📸 Foto"
- URL: `/clienti/[id]`
- Storico completo lavori con foto prima/dopo
- Bottone "Nuovo Lavoro" sempre visibile

### Nuovo Lavoro
**Modal completo con:**
- Selezione Operatore (dropdown)
- Selezione Servizio (opzionale)
- Note testuali
- Upload foto PRIMA (max 5)
- Upload foto DOPO (max 5)

**Modalità acquisizione foto:**
1. 📷 **Camera** - Webcam con switch front/rear camera
2. 📁 **Galleria** - File picker immagini
3. 🗑️ **Rimozione** - Preview con bottone elimina

### Visualizzazione Lavori
**Card espandibili per ogni lavoro:**
- Header: Data, Operatore, Servizio, Note
- Badge: Conteggio foto PRIMA/DOPO
- Click: Espandi/Comprimi foto
- Griglia responsive: 2x2 tablet/PC, carousel mobile
- Lightbox: Click foto → fullscreen con nav ←/→

### Gestione Foto
- **Compressione automatica**: Max 1200px, quality 85%
- **Upload Vercel Blob**: Storage pubblico cloud
- **Ordine sequenziale**: 1,2,3,4,5 per tipo
- **Eliminazione lavoro**: Cascata su tutte le foto

## 🗄️ Schema Database

```prisma
model FotoLavoro {
  id          String     @id @default(cuid())
  clienteId   Int
  operatoreId String
  servizioId  String?
  data        DateTime   @default(now())
  note        String?

  cliente     Cliente    @relation(...)
  operatore   Operatore  @relation(...)
  servizio    Servizio?  @relation(...)
  foto        Foto[]

  @@map("foto_lavori")
}

model Foto {
  id           String     @id @default(cuid())
  fotoLavoroId String
  url          String     // Vercel Blob URL
  tipo         String     // "prima" | "dopo"
  ordine       Int        // 1-5

  fotoLavoro   FotoLavoro @relation(...)

  @@unique([fotoLavoroId, tipo, ordine])
  @@map("foto")
}
```

## ☁️ Setup Vercel Blob (OBBLIGATORIO per produzione)

### 1. Crea Blob Store su Vercel

```bash
# Nel dashboard Vercel del progetto:
1. Storage → Create → Blob
2. Nome: "salone-foto-lavori"
3. Copia il token generato
```

### 2. Aggiungi variabile ambiente

**Locale (.env):**
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

**Vercel (Dashboard):**
```
Settings → Environment Variables → Add
Name: BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_...
Environments: ✓ Production ✓ Preview ✓ Development
```

### 3. Redeploy

```bash
git add .
git commit -m "feat: galleria foto multipla prima/dopo"
git push origin main
```

Vercel farà automaticamente redeploy con la nuova variabile.

## 📱 UI/UX

### Desktop/Tablet
- Griglia foto 2x2 o 3x3
- Hover: Mostra bottone elimina + icona zoom
- Click foto: Lightbox fullscreen con navigazione

### Mobile
- Griglia foto 2 colonne
- Touch: Lightbox con swipe gesture
- Camera: Selfie mode di default

### Responsive
- Tailwind grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- Image Next.js: Ottimizzazione automatica
- Modal: Fullscreen mobile, centered desktop

## 📂 File Creati

```
src/
├── app/
│   ├── actions/
│   │   ├── foto-lavori.ts          # CRUD foto lavori
│   │   └── clienti.ts              # +getClienteById
│   ├── clienti/
│   │   ├── [id]/
│   │   │   └── page.tsx            # Dettaglio cliente + galleria
│   │   └── components/
│   │       ├── NuovoLavoroModal.tsx  # Modal crea lavoro
│   │       ├── LavoroCard.tsx        # Card lavoro espandibile
│   │       └── ClientiList.tsx       # +bottone foto
│   └── components/
│       ├── CameraUploader.tsx      # Camera + file picker
│       └── FotoGrid.tsx            # Griglia responsive + lightbox
├── lib/
│   └── upload.ts                   # Upload + compressione
└── prisma/
    ├── schema.prisma               # +FotoLavoro +Foto
    └── migrations/
        └── 20251229130315_add_foto_lavoro/
            └── migration.sql

package.json                        # +@vercel/blob +react-webcam
```

## 🎨 Palette Colori

- **Verde**: Nuovo lavoro button (`bg-green-600`)
- **Blu**: Foto button, modal header (`bg-blue-600`)
- **Rosso**: Elimina (`bg-red-600`)
- **Grigio**: Borders, backgrounds (`bg-gray-50/100/200`)

## 🚀 Comandi Utili

```bash
# Genera Prisma Client dopo schema changes
npx prisma generate

# Crea migration
npx prisma migrate dev --name descrizione

# Build locale
npm run build

# Dev server
npm run dev

# Deploy Vercel
git push origin main
```

## 🔍 Debug

### Foto non si caricano
```bash
# Verifica token Vercel Blob
echo $BLOB_READ_WRITE_TOKEN

# Check logs upload
# src/lib/upload.ts console.error
```

### Camera non funziona
```bash
# Richiede HTTPS in produzione
# Locale: http://localhost OK
# Vercel: https://... OK
# HTTP normale: ❌ Browser blocca webcam
```

### Migration fallita
```bash
# Reset database (⚠️ PERDE DATI)
npx prisma migrate reset

# Riapplica migration
npx prisma migrate deploy
```

## 📸 Screenshot Flow

1. **Lista Clienti** → Click nome o "📸 Foto"
2. **Dettaglio Cliente** → "Nuovo Lavoro"
3. **Modal Lavoro**:
   - Operatore: Maria Rossi ⬇️
   - Servizio: Taglio ⬇️
   - Note: "Cliente soddisfatto"
   - 📸 PRIMA (0/5) [+ Aggiungi]
   - 📸 DOPO (0/5) [+ Aggiungi]
4. **Scelta Modalità**: 📷 Camera | 📁 Galleria
5. **Preview Grid**: Miniature con X per rimuovere
6. **Salva** → Upload compresso → Storico lavori

## ✨ Features Premium

- Compressione automatica (risparmio storage 70-80%)
- Lightbox con keyboard navigation (←/→/ESC)
- Lazy loading immagini
- Ordine sequenziale garantito
- Delete cascade (elimina lavoro → elimina tutte foto)
- Responsive completo mobile/tablet/desktop

## 🎯 Pronto per Deploy Vercel! ✅

Tutto configurato per produzione. Manca solo:
1. Creare Blob Store su Vercel
2. Aggiungere `BLOB_READ_WRITE_TOKEN`
3. Push → Deploy automatico

---

**Build Status**: ✅ Compiled successfully
**Routes**: `/clienti/[id]` dinamica
**First Load JS**: 109 kB (ottimizzato)
