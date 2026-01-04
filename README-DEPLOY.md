# 🚀 DEPLOY SU VERCEL - GUIDA COMPLETA

## ✅ SETUP COMPLETATO

Il progetto è pronto per il deploy su Vercel con PostgreSQL.

## 📋 PASSI PER IL DEPLOY

### 1. Crea Database PostgreSQL su Vercel

1. Vai su https://vercel.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Storage** → **Create Database**
4. Seleziona **Postgres** → **Continue**
5. Scegli regione (preferibilmente vicino a te)
6. Clicca **Create**

### 2. Collega il Database al Progetto

Vercel collegherà automaticamente la variabile `DATABASE_URL` al tuo progetto.

### 3. Deploy

```bash
git add .
git commit -m "feat: migrate to PostgreSQL for Vercel"
git push
```

Vercel farà automaticamente il deploy e:
- Installerà le dipendenze
- Genererà Prisma Client
- Eseguirà le migrazioni del database
- Builderà il progetto

## 🔧 SVILUPPO LOCALE

Per continuare a sviluppare in locale con SQLite:

1. Crea file `.env.local`:
```bash
DATABASE_URL="file:./prisma/dev.db"
```

2. Torna temporaneamente a SQLite in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Rigenera Prisma:
```bash
npx prisma generate
npx prisma db push
```

**IMPORTANTE:** Prima di fare commit, riporta `provider = "postgresql"` in `schema.prisma`!

## 🎯 SEED DATABASE IN PRODUZIONE

Il seed automatico è disabilitato in produzione. Per popolare il database:

1. Vai su Vercel Dashboard → Storage → Postgres
2. Apri la console SQL
3. Inserisci manualmente i dati iniziali oppure:

Crea uno script seed separato e eseguilo una volta:
```bash
npx tsx prisma/seed-production.ts
```

## 📁 FILE MODIFICATI

- ✅ `prisma/schema.prisma` - SQLite → PostgreSQL
- ✅ `package.json` - Script build ottimizzato
- ✅ `vercel.json` - Configurazione deploy
- ✅ `prisma/migrations/` - Migrazione iniziale PostgreSQL
- ✅ `.env.example` - Template variabili ambiente

## 🐛 TROUBLESHOOTING

### Errore: "Prisma Client could not be generated"
```bash
# Su Vercel, verifica che installCommand in vercel.json includa:
"installCommand": "npm ci && npx prisma generate"
```

### Errore: "Cannot find module '@prisma/client'"
Esegui in locale:
```bash
rm -rf node_modules .next
npm install
npx prisma generate
```

### Database non aggiornato
Vercel Dashboard → Storage → Postgres → Reset Database (attenzione: cancella tutti i dati!)

## 🎉 DEPLOY COMPLETATO!

Dopo il deploy, l'app sarà disponibile su: `https://tuo-progetto.vercel.app`
