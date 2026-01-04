'use client'

type Appuntamento = {
  id: number
  dataOra: Date
  durata: number
  stato: string
  cliente: {
    cognome: string
    nome: string
  }
  servizi: {
    servizio: {
      prezzo: number
    }
  }[]
}

export default function DashboardStats({
  appuntamenti
}: {
  appuntamenti: Appuntamento[]
}) {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  // Appuntamenti di oggi
  const appuntamentiOggi = appuntamenti.filter(app => {
    const appDate = new Date(app.dataOra)
    return appDate >= todayStart && appDate <= todayEnd
  })

  const oggiCount = appuntamentiOggi.length

  // Calcola incassi oggi (solo appuntamenti confermati/completati)
  const incassiOggi = appuntamentiOggi
    .filter(app => app.stato === 'confermato' || app.stato === 'completato')
    .reduce((sum, app) => {
      const totaleServizi = app.servizi.reduce((s, serv) => s + serv.servizio.prezzo, 0)
      return sum + totaleServizi
    }, 0)

  // Percentuale slot occupati (assumendo 10 slot disponibili al giorno)
  const slotsDisponibili = 10
  const percentualeOggi = Math.min(Math.round((oggiCount / slotsDisponibili) * 100), 100)

  // Prossimo appuntamento
  const prossimiAppuntamenti = appuntamenti
    .filter(app => new Date(app.dataOra) > now)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())

  const prossimoApp = prossimiAppuntamenti[0]
  const prossimoCliente = prossimoApp
    ? prossimoApp.cliente.cognome.toUpperCase()
    : 'Nessuno'
  const prossimoOra = prossimoApp
    ? new Date(prossimoApp.dataOra).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : '--:--'
  const minutiMancanti = prossimoApp
    ? Math.max(0, Math.round((new Date(prossimoApp.dataOra).getTime() - now.getTime()) / 60000))
    : 0

  // Target giornaliero (esempio: €300)
  const targetGiornaliero = 300
  const targetReached = incassiOggi >= targetGiornaliero

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl mb-6">

      {/* Oggi */}
      <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-emerald-400 hover:shadow-xl transition-all">
        <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-2">{oggiCount}</div>
        <div className="text-sm md:text-base text-gray-600 font-semibold tracking-wide">Appuntamenti Oggi</div>
        <div className="text-xs text-emerald-600 mt-1 font-medium">{percentualeOggi}% slot occupati</div>
      </div>

      {/* Incassi */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all">
        <div className="text-3xl md:text-4xl font-black mb-2">€{incassiOggi.toFixed(0)}</div>
        <div className="text-sm md:text-base font-semibold opacity-90 tracking-wide">Incassi Oggi</div>
        <div className="text-xs mt-1 bg-white/20 px-2 py-1 rounded-full inline-block">
          {targetReached ? '🎯 Obiettivo!' : '💰 Continua!'}
        </div>
      </div>

      {/* Prossimo */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl shadow-lg border-l-4 border-orange-400 group hover:shadow-xl transition-all">
        <div className="font-bold text-orange-800 text-sm mb-1 flex items-center">
          ⏰ Prossimo appuntamento
        </div>
        <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{prossimoCliente}</div>
        <div className="text-lg font-semibold text-gray-700">{prossimoOra}</div>
        {minutiMancanti > 0 && (
          <div className="text-xs text-gray-500 mt-1">tra {minutiMancanti} min</div>
        )}
      </div>
    </div>
  )
}
