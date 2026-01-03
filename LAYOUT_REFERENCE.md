# Salone MVP - Layout Reference

## 📐 Impaginazione Completa

### 1. LAYOUT GLOBALE

```
┌─────────────────────────────────────┐
│                                     │
│         CONTENT AREA                │
│      (scroll verticale)             │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Home] [Op] [Srv] [Cli] [Agenda]  │ ← Bottom Nav Fixed
└─────────────────────────────────────┘
```

**Specifiche**:
- Background: `bg-gray-50` (#f9fafb)
- Bottom padding: `pb-20` (80px) per evitare overlap con nav
- Bottom Nav: `fixed bottom-0` height 64px, `z-50`

---

### 2. NAVBAR BOTTOM (BottomNav.tsx)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
  <div className="flex justify-around items-center h-16">
    {/* 5 icone: Home, Operatori, Servizi, Clienti, Agenda */}
  </div>
</nav>
```

**Icone**:
- Dimensione: `w-6 h-6` (24x24px)
- Label: `text-xs mt-1 font-medium`
- Colore attivo: `text-blue-600`
- Colore inattivo: `text-gray-600 hover:text-blue-600`

---

### 3. HEADER PAGINA STANDARD

```tsx
<div className="bg-white shadow-sm sticky top-0 z-10">
  <div className="px-4 py-4">
    <h1 className="text-2xl font-bold text-gray-900">Titolo</h1>
    <p className="text-sm text-gray-600 mt-1">Sottotitolo</p>
  </div>
</div>
```

**Spacing**:
- Padding: `px-4 py-4` (16px orizzontale, 16px verticale)
- Title: `text-2xl` (24px), `font-bold`
- Subtitle: `text-sm` (14px), `mt-1` (4px gap)

---

### 4. OPERATORI - Schede con Colore

```
┌─────────────────────────────────────┐
│ ● Anna Verdi                        │ ← Border left colore operatore
│   anna@email.com                    │
│                                     │
│   [✓ Attivo]  [Modifica]  [Elimina]│
└─────────────────────────────────────┘
```

```tsx
<div className="bg-white rounded-lg shadow p-4"
     style={{ borderLeft: `4px solid ${operatore.colore}` }}>
  {/* Avatar rotondo */}
  <div className="w-10 h-10 rounded-full" 
       style={{ backgroundColor: operatore.colore }} />
  
  {/* Nome e dettagli */}
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{nome} {cognome}</h3>
    <p className="text-sm text-gray-500">{email}</p>
  </div>
</div>
```

**Colori predefiniti**:
- Rosso: `#FF6B6B`
- Blu: `#4ECDC4`
- Verde: `#95E1D3`
- Giallo: `#F38181`

---

### 5. SERVIZI - Layout Compatto (1 riga desktop)

```
┌──────────────────────────────────────────────────┐
│ Taglio Donna  │ €45,00  │ 60 min │ [Mod] [Elim] │
│ Piega         │ €25,00  │ 30 min │ [Mod] [Elim] │
│ Colore        │ €80,00  │ 90 min │ [Mod] [Elim] │
└──────────────────────────────────────────────────┘
```

```tsx
{/* Desktop: flex row */}
<div className="hidden md:flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
  <div className="flex-1 font-medium">{nome}</div>
  <div className="text-green-600 font-bold">{formatPrezzo(prezzo)}</div>
  <div className="text-gray-600">{durata} min</div>
  <div className="flex gap-2">
    <button>Modifica</button>
    <button>Elimina</button>
  </div>
</div>

{/* Mobile: stack verticale */}
<div className="md:hidden space-y-2 p-4 border-b">
  <div className="font-medium text-lg">{nome}</div>
  <div className="flex justify-between">
    <span className="text-green-600">{prezzo}</span>
    <span className="text-gray-600">{durata} min</span>
  </div>
  <div className="flex gap-2">...</div>
</div>
```

---

### 6. AGENDA GIORNALIERA - Griglia Operatori × Orari

```
         Anna       Maria      Giulia
8:00  ┌────────┐ ┌────────┐ ┌────────┐
      │Cliente │ │        │ │Cliente │
      │Taglio  │ │        │ │Colore  │
9:00  └────────┘ └────────┘ └────────┘
10:00            ┌────────┐
                 │Cliente │
                 │Piega   │
11:00            └────────┘
```

```tsx
<div className="grid grid-cols-4 gap-2"> {/* 1 col orari + 3 operatori */}
  {/* Colonna Orari */}
  <div className="sticky left-0 bg-white">
    {orari.map(ora => (
      <div className="h-20 flex items-center justify-center border-b">
        {ora}
      </div>
    ))}
  </div>
  
  {/* Colonne Operatori */}
  {operatori.map(op => (
    <div>
      <div className="sticky top-0 bg-blue-50 p-2 font-bold text-center">
        {op.nome}
      </div>
      {/* Slot appuntamenti con posizionamento assoluto */}
    </div>
  ))}
</div>
```

**Slot Appuntamento**:
```tsx
<div className="absolute left-0 right-0 bg-blue-100 border-l-4 border-blue-600 p-2 rounded"
     style={{ 
       top: `${(minutiDalleOtto / 60) * 80}px`,
       height: `${(durata / 60) * 80}px`
     }}>
  <div className="font-semibold text-sm">{ora}</div>
  <div className="text-xs">{cliente.nome}</div>
  <div className="text-xs text-gray-600">{servizio.nome}</div>
</div>
```

---

### 7. AGENDA SETTIMANALE - Matrice Giorni × Operatori

```
           LUN   MAR   MER   GIO   VEN   SAB   DOM
Anna     ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
         │8:30│ │   │ │9:00│ │   │ │10:00 │   │ │   │
         └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘

Maria    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
         │   │ │9:00│ │   │ │8:30│ │   │ │11:00 │   │
         └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
```

```tsx
<div className="overflow-x-auto">
  <div className="min-w-[800px]"> {/* Force horizontal scroll su mobile */}
    
    {/* Header Giorni */}
    <div className="grid grid-cols-8 sticky top-0 bg-gray-50 z-10">
      <div className="p-2">Operatore</div>
      {giorni.map(giorno => (
        <div className="p-2 text-center font-semibold border-r">
          {formatGiorno(giorno)}
        </div>
      ))}
    </div>
    
    {/* Righe Operatori */}
    {operatori.map(operatore => (
      <div className="grid grid-cols-8 border-b hover:bg-gray-50">
        <div className="p-2 border-r bg-white sticky left-0">
          {operatore.nome}
        </div>
        
        {giorni.map(giorno => {
          const appuntamenti = getAppuntamenti(operatore.id, giorno)
          return (
            <div className="p-1 border-r min-h-[80px]">
              {appuntamenti.map(app => (
                <div className="text-xs mb-1 p-1 bg-blue-100 rounded">
                  <div className="font-bold">{formatOra(app.dataOra)}</div>
                  <div>{app.servizio?.nome}</div>
                  <div className="text-gray-600">{app.cliente.nome}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    ))}
  </div>
</div>
```

---

### 8. CAMERA MODAL - Scatto Foto

```
┌─────────────────────────────────────┐
│ [✕]  📸 Foto PRIMA           [🔄]  │ ← Header 10%
├─────────────────────────────────────┤
│                                     │
│                                     │
│          VIDEO PREVIEW              │ ← Preview 80%
│           (Webcam)                  │
│                                     │
│                                     │
├─────────────────────────────────────┤
│              ⚪                     │
│             ⬤                       │ ← Bottone 96x96px
│          (SCATTA)                   │
│                                     │
│     [📁 Seleziona dalla galleria]  │ ← Footer 10%
└─────────────────────────────────────┘
```

```tsx
<div className="fixed inset-0 bg-black z-50 flex flex-col">
  {/* HEADER - 10% */}
  <div className="flex justify-between items-center p-4 bg-black/50">
    <button onClick={onClose}>✕</button>
    <div>📸 Foto {tipo.toUpperCase()}</div>
    <button onClick={switchCamera}>🔄</button>
  </div>

  {/* VIDEO PREVIEW - 80% */}
  <div className="flex-1 flex items-center justify-center bg-black">
    <Webcam ref={webcamRef} className="w-full h-full object-cover" />
  </div>

  {/* BOTTONI BOTTOM - 10% */}
  <div className="p-6 space-y-4 bg-black/30">
    <div className="flex justify-center">
      <button onClick={capture} className="w-24 h-24 bg-white rounded-full">
        <div className="w-20 h-20 bg-red-500 rounded-full">
          <span className="text-4xl">📷</span>
        </div>
      </button>
    </div>
    <button onClick={openGallery}>📁 Seleziona dalla galleria</button>
  </div>
</div>
```

---

### 9. RESPONSIVE BREAKPOINTS

```css
/* Mobile First */
.container { padding: 1rem; }               /* 16px */

/* Tablet (md: 768px+) */
@media (min-width: 768px) {
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .hidden.md\\:block { display: block; }
}

/* Desktop (lg: 1024px+) */
@media (min-width: 1024px) {
  .grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
  .container { max-width: 1280px; margin: 0 auto; }
}
```

**Agenda Responsive**:
- Mobile: 2 colonne (orari + 1 operatore) - scroll orizzontale
- Tablet: 3-4 colonne (orari + 2-3 operatori)
- Desktop: 5+ colonne (orari + tutti operatori visibili)

---

### 10. COLORI E PALETTE

**Primari**:
- Blue: `#3B82F6` (bg-blue-600, focus ring)
- Gray-50: `#F9FAFB` (background app)
- White: `#FFFFFF` (cards, nav)

**Stati**:
- Success: `#10B981` (green-500)
- Warning: `#F59E0B` (yellow-500)
- Error: `#EF4444` (red-500)
- Info: `#3B82F6` (blue-500)

**Operatori** (colori custom):
- Rosso: `#FF6B6B`
- Turchese: `#4ECDC4`
- Verde: `#95E1D3`
- Rosa: `#F38181`
- Arancione: `#FFA07A`

---

### 11. TIPOGRAFIA

```css
/* Headings */
h1 { font-size: 1.5rem; font-weight: 700; }   /* 24px bold */
h2 { font-size: 1.25rem; font-weight: 600; }  /* 20px semibold */
h3 { font-size: 1.125rem; font-weight: 600; } /* 18px semibold */

/* Body */
p { font-size: 1rem; line-height: 1.5; }      /* 16px */
.text-sm { font-size: 0.875rem; }             /* 14px */
.text-xs { font-size: 0.75rem; }              /* 12px */

/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

---

### 12. SPACING SYSTEM

```
gap-1  = 4px    (tight spacing)
gap-2  = 8px    (compact layout)
gap-3  = 12px   (default spacing)
gap-4  = 16px   (comfortable)
gap-6  = 24px   (generous)
gap-8  = 32px   (sections)

p-2    = 8px    (button padding)
p-4    = 16px   (card padding)
p-6    = 24px   (modal padding)

mb-20  = 80px   (bottom nav clearance)
```

---

### 13. SHADOW & BORDERS

```css
/* Shadows */
shadow-sm  = 0 1px 2px rgba(0,0,0,0.05)   /* Subtle */
shadow     = 0 1px 3px rgba(0,0,0,0.1)    /* Default cards */
shadow-lg  = 0 10px 15px rgba(0,0,0,0.1)  /* Bottom nav */
shadow-2xl = 0 25px 50px rgba(0,0,0,0.25) /* Modals */

/* Borders */
border          = 1px solid #E5E7EB (gray-200)
border-2        = 2px solid
border-l-4      = 4px left border (operatori highlight)
rounded-lg      = 8px border-radius
rounded-full    = 9999px (avatar, buttons)
```

---

## ✅ CHECKLIST LAYOUT COMPLETO

- [x] CSS reset Tailwind pulito
- [x] Bottom Nav fixed e responsive
- [x] Header pagine consistente
- [x] Operatori: schede con colore e avatar
- [x] Servizi: layout compatto desktop/mobile
- [x] Agenda giornaliera: griglia operatori × orari
- [x] Agenda settimanale: matrice giorni × operatori
- [x] Camera modal: bottone rosso centrale 96x96px
- [x] Responsive breakpoints mobile/tablet/desktop
- [x] Spacing consistente (gap-2, gap-4, p-4)
- [x] Tipografia scale (text-2xl, text-lg, text-sm, text-xs)
- [x] Colori palette operatori custom

---

## 🚀 BUILD E DEPLOY

```bash
# Sviluppo locale
npm run dev        # → http://localhost:3000

# Build produzione
npm run build      # ✅ Compilato senza errori
npm start          # Server produzione

# Deploy VPS
git push origin main
# Docker/PM2 restart
```

---

## 📱 TEST RESPONSIVE

**Mobile (375px)**:
- Bottom Nav full width
- Servizi stack verticale
- Agenda 2 colonne scroll orizzontale

**Tablet (768px)**:
- Servizi flex row
- Agenda 3-4 colonne

**Desktop (1280px+)**:
- Tutti operatori visibili
- Servizi tabella compatta
- Agenda 5+ colonne

---

Generato il 2026-01-03 con [Claude Code](https://claude.com/claude-code)
