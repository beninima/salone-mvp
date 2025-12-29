'use client'

import { useState, useMemo } from 'react'
import { deleteAppuntamento, updateAppuntamentoStato } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'

type Operatore = {
  id: string
  nome: string
  cognome: string
  colore: string | null
}

type Appuntamento = {
  id: number
  dataOra: Date
  servizio: string
  durata: number
  stato: string
  cliente: {
    id: number
    nome: string
    cognome: string
  }
  operatore: Operatore
}

type WeekData = {
  startOfWeek: Date
  endOfWeek: Date
} | null

export default function AppuntamentiWeekView({
  appuntamenti,
  operatori,
  weekData
}: {
  appuntamenti: Appuntamento[]
  operatori: Operatore[]
  weekData: WeekData
}) {
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [selectedApp, setSelectedApp] = useState<Appuntamento | null>(null)
  const router = useRouter()

  // Genera i 7 giorni della settimana (Lun-Dom)
  const weekDays = useMemo(() => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Trova il lunedì della settimana
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const start = new Date(today)
    start.setDate(today.getDate() + diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return days
  }, [])

  // Raggruppa appuntamenti per operatore e per giorno
  const appuntamentiPerOperatoreEGiorno = useMemo(() => {
    const grouped: {
      [operatoreId: string]: {
        operatore: Operatore
        perGiorno: { [dateKey: string]: Appuntamento[] }
      }
    } = {}

    // Inizializza struttura per ogni operatore
    operatori.forEach(op => {
      const perGiorno: { [dateKey: string]: Appuntamento[] } = {}
      weekDays.forEach(day => {
        const dateKey = day.toISOString().split('T')[0]
        perGiorno[dateKey] = []
      })
      grouped[op.id] = {
        operatore: op,
        perGiorno
      }
    })

    // Raggruppa appuntamenti
    appuntamenti.forEach(app => {
      const date = new Date(app.dataOra)
      const dateKey = date.toISOString().split('T')[0]
      const operatoreId = app.operatore.id

      if (grouped[operatoreId]?.perGiorno[dateKey]) {
        grouped[operatoreId].perGiorno[dateKey].push(app)
      }
    })

    return grouped
  }, [appuntamenti, operatori, weekDays])

  const formatDayHeader = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = new Date(date)
    day.setHours(0, 0, 0, 0)

    const isToday = day.getTime() === today.getTime()

    return {
      weekday: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('it-IT', { month: 'short' }),
      isToday
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'bg-blue-50 border-blue-300'
      case 'completato':
        return 'bg-green-50 border-green-300'
      case 'cancellato':
        return 'bg-gray-50 border-gray-300 opacity-60'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  const handleCompleta = async (id: number) => {
    setActioningId(id)
    const result = await updateAppuntamentoStato(id, 'completato')
    setActioningId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleAnnulla = async (id: number) => {
    setActioningId(id)
    const result = await updateAppuntamentoStato(id, 'cancellato')
    setActioningId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleEliminaDefinitivamente = async (id: number) => {
    // Confirmation dialog with clear message
    const confirmed = confirm(
      'Elimina definitivamente l\'appuntamento?\n\n' +
      'Questa azione non è reversibile. Vuoi davvero eliminare l\'appuntamento dal sistema?'
    )

    if (!confirmed) return

    setActioningId(id)
    const result = await deleteAppuntamento(id)
    setActioningId(null)

    if (result.success) {
      setSelectedApp(null)
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleChangeStato = async (id: number, stato: string) => {
    setActioningId(id)
    const result = await updateAppuntamentoStato(id, stato)
    setActioningId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const totalAppuntamenti = appuntamenti.length

  if (operatori.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Nessun operatore attivo configurato</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Vista Settimanale ({totalAppuntamenti} {totalAppuntamenti === 1 ? 'appuntamento' : 'appuntamenti'})
      </h2>

      {/* Vista a colonne per operatore */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {operatori.map((operatore) => {
            const operatoreData = appuntamentiPerOperatoreEGiorno[operatore.id]
            if (!operatoreData) return null

            const operatoreAppuntamenti = Object.values(operatoreData.perGiorno).flat()
            const count = operatoreAppuntamenti.length

            return (
              <div key={operatore.id} className="mb-6">
                {/* Header operatore */}
                <div
                  className="flex items-center gap-2 mb-2 p-3 rounded-lg"
                  style={{ backgroundColor: operatore.colore ? `${operatore.colore}20` : '#E5E7EB' }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: operatore.colore || '#3B82F6' }}
                  />
                  <h3 className="font-semibold text-lg">{operatore.cognome} {operatore.nome}</h3>
                  <span className="text-sm text-gray-600">({count})</span>
                </div>

                {/* Griglia giorni */}
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const header = formatDayHeader(day)
                    const dateKey = day.toISOString().split('T')[0]
                    const dayAppuntamenti = operatoreData.perGiorno[dateKey] || []

                    return (
                      <div key={dateKey} className="min-h-[120px]">
                        {/* Header giorno */}
                        <div
                          className={`text-center py-2 rounded-t-lg ${
                            header.isToday
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="text-xs font-medium uppercase">{header.weekday}</div>
                          <div className="text-lg font-bold">{header.day}</div>
                          <div className="text-[10px]">{header.month}</div>
                        </div>

                        {/* Appuntamenti del giorno */}
                        <div className="bg-white border border-t-0 rounded-b-lg p-1 space-y-1 min-h-[100px]">
                          {dayAppuntamenti.map((app) => (
                            <button
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className={`w-full text-left p-1.5 rounded border text-xs ${getStatoColor(app.stato)} hover:shadow-md transition-shadow`}
                              style={{ borderLeftWidth: '3px', borderLeftColor: operatore.colore || '#3B82F6' }}
                            >
                              <div className="font-semibold truncate">
                                {formatTime(app.dataOra)}
                              </div>
                              <div className="truncate text-gray-700 text-[11px]">
                                {app.cliente.cognome}
                              </div>
                              <div className="truncate text-gray-500 text-[10px]">
                                {app.durata}min
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal dettaglio appuntamento */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-3">Dettaglio Appuntamento</h3>

            <div className="space-y-2 mb-4">
              <div>
                <span className="text-sm text-gray-600">Cliente:</span>
                <div className="font-semibold">
                  {selectedApp.cliente.cognome} {selectedApp.cliente.nome}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Operatore:</span>
                <div className="font-semibold flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedApp.operatore.colore || '#3B82F6' }}
                  />
                  {selectedApp.operatore.cognome} {selectedApp.operatore.nome}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Data e Ora:</span>
                <div className="font-semibold">
                  {new Date(selectedApp.dataOra).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })} - {formatTime(selectedApp.dataOra)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Servizio:</span>
                <div className="font-semibold">{selectedApp.servizio}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Durata:</span>
                <div className="font-semibold">{selectedApp.durata} minuti</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Stato:</span>
                <div className="font-semibold capitalize">{selectedApp.stato}</div>
              </div>
            </div>

            {/* Azioni - Small buttons in horizontal row */}
            <div className="space-y-3">
              <div className="flex gap-2 items-center flex-wrap">
                {selectedApp.stato === 'confermato' && (
                  <>
                    <button
                      onClick={() => handleCompleta(selectedApp.id)}
                      disabled={actioningId === selectedApp.id}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      ✓ Completa
                    </button>
                    <button
                      onClick={() => handleAnnulla(selectedApp.id)}
                      disabled={actioningId === selectedApp.id}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      Annulla
                    </button>
                  </>
                )}

                {selectedApp.stato !== 'confermato' && (
                  <button
                    onClick={() => handleChangeStato(selectedApp.id, 'confermato')}
                    disabled={actioningId === selectedApp.id}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Ripristina
                  </button>
                )}

                <button
                  onClick={() => handleEliminaDefinitivamente(selectedApp.id)}
                  disabled={actioningId === selectedApp.id}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actioningId === selectedApp.id ? 'Eliminazione...' : 'Elimina definitivamente'}
                </button>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
