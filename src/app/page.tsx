import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    totalClienti,
    appuntamentiOggi,
    appuntamentiProssimi
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.appuntamento.count({
      where: {
        dataOra: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
    prisma.appuntamento.findMany({
      where: {
        dataOra: {
          gte: today
        },
        stato: 'confermato'
      },
      include: {
        cliente: true
      },
      orderBy: {
        dataOra: 'asc'
      },
      take: 5
    })
  ])

  return {
    totalClienti,
    appuntamentiOggi,
    appuntamentiProssimi
  }
}

export default async function HomePage() {
  const data = await getDashboardData()

  const formatDateTime = (date: Date) => {
    const d = new Date(date)
    return {
      date: d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Salone MVP</h1>
          <p className="text-blue-100">Gestionale Parrucchiera</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6 grid grid-cols-2 gap-4">
        <Link href="/clienti" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-600">{data.totalClienti}</div>
          <div className="text-base text-gray-600 mt-1">Clienti Totali</div>
        </Link>

        <Link href="/appuntamenti" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600">{data.appuntamentiOggi}</div>
          <div className="text-base text-gray-600 mt-1">Oggi</div>
        </Link>
      </div>

      {/* Prossimi Appuntamenti */}
      <div className="px-6 py-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold text-gray-900">Prossimi Appuntamenti</h2>
          <Link href="/appuntamenti" className="text-blue-600 text-base font-medium">
            Vedi tutti →
          </Link>
        </div>

        {data.appuntamentiProssimi.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Nessun appuntamento in programma</p>
            <Link
              href="/appuntamenti"
              className="inline-block mt-3 px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700"
            >
              Crea Appuntamento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.appuntamentiProssimi.map((app) => {
              const dt = formatDateTime(app.dataOra)
              return (
                <div key={app.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold text-blue-600">{dt.time}</div>
                      <div className="text-xs text-gray-600">{dt.date}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {app.cliente.cognome} {app.cliente.nome}
                      </h3>
                      <p className="text-base text-gray-600">{app.servizio}</p>
                      <p className="text-xs text-gray-500">{app.durata} min</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Azioni Rapide</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/clienti"
            className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="text-base font-medium text-gray-900">Nuovo Cliente</div>
          </Link>
          <Link
            href="/appuntamenti"
            className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="text-base font-medium text-gray-900">Nuovo Appuntamento</div>
          </Link>
          <Link
            href="/interventi"
            className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">✂️</div>
            <div className="text-base font-medium text-gray-900">Nuovo Intervento</div>
          </Link>
          <Link
            href="/prodotti"
            className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🧴</div>
            <div className="text-base font-medium text-gray-900">Gestisci Prodotti</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
