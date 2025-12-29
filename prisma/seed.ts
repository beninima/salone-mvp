import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inizio seed database produzione...')

  // Operatori default
  const operatori = [
    { id: 'op-maria', nome: 'Maria', cognome: 'Rossi', colore: '#E91E63', attivo: true },
    { id: 'op-giulia', nome: 'Giulia', cognome: 'Bianchi', colore: '#9C27B0', attivo: true },
    { id: 'op-anna', nome: 'Anna', cognome: 'Verdi', colore: '#FF9800', attivo: true },
  ]

  console.log('📝 Creazione operatori...')
  for (const op of operatori) {
    await prisma.operatore.upsert({
      where: { id: op.id },
      update: op,
      create: op,
    })
    console.log(`  ✅ Operatore: ${op.nome} ${op.cognome}`)
  }

  // Servizi default
  const servizi = [
    { id: 'srv-taglio', nome: 'Taglio', prezzo: 2500, durata: 30, attivo: true },
    { id: 'srv-colore', nome: 'Colore', prezzo: 4500, durata: 90, attivo: true },
    { id: 'srv-meches', nome: 'Mèches', prezzo: 6000, durata: 120, attivo: true },
    { id: 'srv-piega', nome: 'Piega', prezzo: 2000, durata: 45, attivo: true },
    { id: 'srv-trattamento', nome: 'Trattamento', prezzo: 3500, durata: 60, attivo: true },
  ]

  console.log('💇 Creazione servizi...')
  for (const s of servizi) {
    await prisma.servizio.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    })
    console.log(`  ✅ Servizio: ${s.nome} - €${(s.prezzo / 100).toFixed(2)}`)
  }

  console.log('\n✅ SEED COMPLETATO!')
  console.log(`   - ${operatori.length} operatori creati`)
  console.log(`   - ${servizi.length} servizi creati`)
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
