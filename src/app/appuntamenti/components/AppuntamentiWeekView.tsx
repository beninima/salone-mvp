'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAppuntamento, updateAppuntamentoStato } from '@/app/actions/appuntamenti'

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
  const [selectedApp, setSelectedApp] = useState<Appuntamento | null>(null)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const router = useRouter()

  // Helper per date key locale (senza timezone shift)
  const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

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

  // Raggruppa appuntamenti per GIORNO + OPERATORE (nuova struttura)
  const appuntamentiGriglia = useMemo(() => {
    const griglia: {
      [dateKey: string]: {
        [operatoreId: string]: Appuntamento[]
      }
    } = {}

    // Inizializza griglia: per ogni giorno → per ogni operatore → array vuoto
    weekDays.forEach(day => {
      const dateKey = getLocalDateKey(day)
      griglia[dateKey] = {}

      operatori.forEach(op => {
        griglia[dateKey][op.id] = []
      })
    })

    // Popola griglia con appuntamenti
    appuntamenti.forEach(app => {
      const date = new Date(app.dataOra)
      const dateKey = getLocalDateKey(date)
      const operatoreId = app.operatore.id

      if (griglia[dateKey]?.[operatoreId]) {
        griglia[dateKey][operatoreId].push(app)
      }
    })

    return griglia
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

  const handleRipristina = async (id: number) => {
    setActioningId(id)
    const result = await updateAppuntamentoStato(id, 'confermato')
    setActioningId(null)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleElimina = async (id: number) => {
    const confirmed = confirm(
      'Elimina definitivamente l\'appuntamento?\n\n' +
      'Questa azione non è reversibile.'
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

  if (operatori.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Nessun operatore attivo configurato</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-gray-900">
        Vista Settimanale ({appuntamenti.length} {appuntamenti.length === 1 ? 'appuntamento' : 'appuntamenti'})
      </h2>

      {/* GRIGLIA ALLINEATA: Giorni (orizzontale) x Operatori (verticale) */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header giorni */}
          <div className="grid grid-cols-8 border-b bg-gray-50 sticky top-0 z-10">
            <div className="p-2 border-r font-semibold text-xs text-gray-700">
              Operatore
            </div>
            {weekDays.map((day) => {
              const header = formatDayHeader(day)
              return (
                <div
                  key={getLocalDateKey(day)}
                  className={`p-2 text-center border-r ${
                    header.isToday ? 'bg-blue-100 font-bold' : ''
                  }`}
                >
                  <div className="text-[10px] uppercase text-gray-600">{header.weekday}</div>
                  <div className="text-sm font-bold">{header.day}</div>
                  <div className="text-[9px] text-gray-500">{header.month}</div>
                </div>
              )
            })}
          </div>

          {/* Righe operatori */}
          {operatori.map((operatore) => (
            <div key={operatore.id} className="grid grid-cols-8 border-b hover:bg-gray-50">
              {/* Colonna nome operatore */}
              <div
                className="p-2 border-r flex items-center gap-2"
                style={{ backgroundColor: `${operatore.colore}15` }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: operatore.colore || '#3B82F6' }}
                />
                <div className="text-xs font-semibold truncate">
                  {operatore.cognome} {operatore.nome}
                </div>
              </div>

              {/* Colonne giorni */}
              {weekDays.map((day) => {
                const dateKey = getLocalDateKey(day)
                const dayApps = appuntamentiGriglia[dateKey]?.[operatore.id] || []

                return (
                  <div
                    key={dateKey}
                    className="p-1 border-r min-h-[80px] space-y-1"
                  >
                    {dayApps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`w-full text-left p-1.5 rounded border text-[10px] ${getStatoColor(app.stato)} hover:shadow-md transition-shadow`}
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: operatore.colore || '#3B82F6'
                        }}
                      >
                        <div className="font-bold">{formatTime(app.dataOra)}</div>
                        <div className="truncate text-gray-700">{app.cliente.cognome}</div>
                        <div className="truncate text-gray-500">{app.servizio}</div>
                        <div className="text-gray-400">{app.durata}min</div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal dettaglio appuntamento */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-3">Dettaglio Appuntamento</h3>

            <div className="space-y-2 mb-4">
              <div>
                <span className="text-base text-gray-600">Cliente:</span>
                <div className="font-semibold">
                  {selectedApp.cliente.cognome} {selectedApp.cliente.nome}
                </div>
              </div>
              <div>
                <span className="text-base text-gray-600">Operatore:</span>
                <div className="font-semibold flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedApp.operatore.colore || '#3B82F6' }}
                  />
                  {selectedApp.operatore.cognome} {selectedApp.operatore.nome}
                </div>
              </div>
              <div>
                <span className="text-base text-gray-600">Data e Ora:</span>
                <div className="font-semibold">
                  {new Date(selectedApp.dataOra).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })} - {formatTime(selectedApp.dataOra)}
                </div>
              </div>
              <div>
                <span className="text-base text-gray-600">Servizio:</span>
                <div className="font-semibold">{selectedApp.servizio}</div>
              </div>
              <div>
                <span className="text-base text-gray-600">Durata:</span>
                <div className="font-semibold">{selectedApp.durata} minuti</div>
              </div>
              <div>
                <span className="text-base text-gray-600">Stato:</span>
                <div className="font-semibold capitalize">{selectedApp.stato}</div>
              </div>
            </div>

            {/* Azioni */}
            <div className="space-y-3">
              <div className="flex gap-2 items-center flex-wrap">
                <button
                  onClick={() => router.push(`/clienti/${selectedApp.cliente.id}`)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                >
                  📸 Foto Cliente
                </button>

                {selectedApp.stato === 'confermato' && (
                  <>
                    <button
                      onClick={() => handleCompleta(selectedApp.id)}
                      disabled={actioningId === selectedApp.id}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Completa
                    </button>
                    <button
                      onClick={() => handleAnnulla(selectedApp.id)}
                      disabled={actioningId === selectedApp.id}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 disabled:opacity-50"
                    >
                      Annulla
                    </button>
                  </>
                )}

                {selectedApp.stato !== 'confermato' && (
                  <button
                    onClick={() => handleRipristina(selectedApp.id)}
                    disabled={actioningId === selectedApp.id}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    ↻ Ripristina
                  </button>
                )}

                <button
                  onClick={() => handleElimina(selectedApp.id)}
                  disabled={actioningId === selectedApp.id}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {actioningId === selectedApp.id ? 'Eliminazione...' : '🗑 Elimina'}
                </button>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-base font-medium hover:bg-gray-300"
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
