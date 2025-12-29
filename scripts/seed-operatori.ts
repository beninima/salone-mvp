import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding operatori...')

  // Check if we already have operators
  const count = await prisma.operatore.count()
  if (count > 1) {
    console.log(`Already have ${count} operators in database`)
    return
  }

  // Create sample operators
  const operatorsToCreate = [
    {
      id: 'op-maria',
      nome: 'Maria',
      cognome: 'Rossi',
      colore: '#E91E63', // Pink
      attivo: true
    },
    {
      id: 'op-giulia',
      nome: 'Giulia',
      cognome: 'Bianchi',
      colore: '#9C27B0', // Purple
      attivo: true
    },
    {
      id: 'op-anna',
      nome: 'Anna',
      cognome: 'Verdi',
      colore: '#FF9800', // Orange
      attivo: true
    }
  ]

  for (const op of operatorsToCreate) {
    const existing = await prisma.operatore.findUnique({ where: { id: op.id } })
    if (!existing) {
      await prisma.operatore.create({ data: op })
      console.log(`Created operator: ${op.nome} ${op.cognome}`)
    }
  }

  console.log('✓ Operatori created successfully')

  // Show all operators
  const operatori = await prisma.operatore.findMany()
  console.log('\nOperatori in database:')
  operatori.forEach(op => {
    console.log(`- ${op.nome} ${op.cognome} (${op.colore}) - ${op.attivo ? 'Attivo' : 'Inattivo'}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
