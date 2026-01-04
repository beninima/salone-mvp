'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAppuntamento, updateAppuntamentoStato } from '@/app/actions/appuntamenti'
import AppuntamentoEditForm from './AppuntamentoEditForm'

type Cliente = {
  id: number
  nome: string
  cognome: string
}

type Operatore = {
  id: string
  nome: string
  cognome: string
  colore: string | null
}

type Servizio = {
  id: string
  nome: string
  prezzo: number
  durata: number
}

type Appuntamento = {
  id: number
  dataOra: Date
  durata: number
  stato: string
  cliente: {
    id: number
    nome: string
    cognome: string
  }
  operatore: Operatore
  servizi: {
    servizio: {
      id: string
      nome: string
      prezzo: number
      durata: number
    }
    ordine: number
  }[]
}

type WeekData = {
  startOfWeek: Date
  endOfWeek: Date
} | null

export default function AppuntamentiWeekView({
  appuntamenti,
  operatori,
  weekData,
  clienti,
  servizi
}: {
  appuntamenti: Appuntamento[]
  operatori: Operatore[]
  weekData: WeekData
  clienti: Cliente[]
  servizi: Servizio[]
}) {
  const [selectedApp, setSelectedApp] = useState<Appuntamento | null>(null)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const router = useRouter()

  // Helper per date key locale (senza timezone shift)
  const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Genera i 7 giorni della settimana (Lun-Dom) basandosi su weekData
  const weekDays = useMemo(() => {
    const days = []

    // Se weekData è disponibile, usa quello
    if (weekData?.startOfWeek) {
      const start = new Date(weekData.startOfWeek)
      for (let i = 0; i < 7; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        days.push(day)
      }
    } else {
      // Fallback: usa settimana corrente
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const start = new Date(today)
      start.setDate(today.getDate() + diff)

      for (let i = 0; i < 7; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        days.push(day)
      }
    }

    return days
  }, [weekData])

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

  // Calcola riepilogo settimanale
  const totaleDurata = appuntamenti.reduce((sum, app) => sum + app.durata, 0)

  // Formatta range settimana
  const weekRange = weekData
    ? `${new Date(weekData.startOfWeek).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${new Date(weekData.endOfWeek).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}`
    : ''

  return (
    <div className="space-y-0">
      {/* Header compatto verde con riepilogo */}
      <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 bg-emerald-600 text-white rounded-t-lg">
        <h1 className="text-base sm:text-lg md:text-xl font-bold">
          Settimana {weekRange}
        </h1>
        <div className="text-xs sm:text-sm md:text-base font-medium">
          {appuntamenti.length} {appuntamenti.length === 1 ? 'appuntamento' : 'appuntamenti'} / {totaleDurata}min
        </div>
      </div>

      {/* GRIGLIA AD ALTA DENSITÀ */}
      <div className="bg-white rounded-b-lg shadow overflow-x-auto">
        <div className="min-w-[800px] h-[50vh] sm:h-[65vh] md:h-[75vh] flex flex-col">
          {/* Header giorni - super compatto */}
          <div className="grid grid-cols-8 gap-px bg-gray-200 flex-shrink-0">
            <div className="bg-gray-100 p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base font-semibold text-gray-700 border">
              Operatore
            </div>
            {weekDays.map((day) => {
              const header = formatDayHeader(day)
              return (
                <div
                  key={getLocalDateKey(day)}
                  className={`bg-white p-2 sm:p-2.5 md:p-3 text-center border text-xs sm:text-sm md:text-base font-semibold ${
                    header.isToday ? 'bg-blue-100 ring-2 ring-blue-300' : 'text-gray-700'
                  }`}
                >
                  <div className="uppercase text-xs sm:text-sm">{header.weekday}</div>
                  <div className="text-base sm:text-lg md:text-xl font-bold">{header.day}</div>
                </div>
              )
            })}
          </div>

          {/* Righe operatori - flex-1 per riempire spazio */}
          <div className="flex-1 overflow-y-auto">
            {operatori.map((operatore) => (
              <div key={operatore.id} className="grid grid-cols-8 gap-px bg-gray-200 h-full">
                {/* Colonna nome operatore */}
                <div
                  className="bg-white p-2 sm:p-2.5 md:p-3 border flex items-center gap-2"
                  style={{ backgroundColor: `${operatore.colore}10` }}
                >
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: operatore.colore || '#3B82F6' }}
                  />
                  <div className="text-xs sm:text-sm md:text-base font-semibold truncate">
                    {operatore.cognome} {operatore.nome}
                  </div>
                </div>

                {/* Colonne giorni */}
                {weekDays.map((day) => {
                  const dateKey = getLocalDateKey(day)
                  const dayApps = appuntamentiGriglia[dateKey]?.[operatore.id] || []
                  const header = formatDayHeader(day)

                  return (
                    <div
                      key={dateKey}
                      className={`bg-white border min-h-[32px] sm:min-h-[40px] md:min-h-[48px] p-1 relative ${
                        header.isToday ? 'bg-blue-50/50 ring-1 ring-blue-200' : ''
                      }`}
                    >
                      {dayApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`w-full h-full flex flex-col justify-center p-2 sm:p-2.5 md:p-3 bg-white/95 backdrop-blur-sm shadow-lg sm:shadow-xl border-2 rounded-lg hover:shadow-2xl hover:scale-105 transition-all ${getStatoColor(app.stato)}`}
                          style={{
                            borderColor: operatore.colore || '#3B82F6',
                            borderLeftWidth: '3px'
                          }}
                        >
                          <div className="font-bold text-sm sm:text-base md:text-lg text-gray-900 mb-0.5 sm:mb-1">
                            {app.cliente.cognome.toUpperCase()}
                          </div>
                          <div className="text-xs sm:text-sm md:text-base text-gray-600 flex items-start gap-1">
                            <span className="text-xs sm:text-sm">✂️</span>
                            <div className="flex-1">
                              <div className="line-clamp-1">{app.servizi.map(s => s.servizio.nome).join(', ')}</div>
                              <div className="text-[10px] sm:text-xs text-gray-500">
                                {formatTime(app.dataOra)} • {app.durata}min
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal dettaglio appuntamento */}
      {selectedApp && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-6">
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
                <span className="text-base text-gray-600">Servizi:</span>
                <div className="font-semibold">{selectedApp.servizi.map(s => s.servizio.nome).join(', ')}</div>
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
                  onClick={() => {
                    setEditingId(selectedApp.id)
                    setSelectedApp(null)
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                >
                  ✏ Modifica
                </button>

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

      {/* Edit Modal */}
      {editingId !== null && (() => {
        const appToEdit = appuntamenti.find(a => a.id === editingId)
        if (!appToEdit) return null

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6"
            onClick={() => setEditingId(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AppuntamentoEditForm
                appuntamento={appToEdit}
                clienti={clienti}
                operatori={operatori}
                servizi={servizi}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
