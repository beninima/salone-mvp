'use client'

import { useState, useMemo } from 'react'
import { deleteAppuntamento, updateAppuntamentoStato } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'

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
}

type WeekData = {
  startOfWeek: Date
  endOfWeek: Date
} | null

export default function AppuntamentiWeekView({
  appuntamenti,
  weekData
}: {
  appuntamenti: Appuntamento[]
  weekData: WeekData
}) {
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [selectedApp, setSelectedApp] = useState<Appuntamento | null>(null)
  const router = useRouter()

  // Genera i 7 giorni della settimana (Lun-Dom)
  const weekDays = useMemo(() => {
    if (!weekData) return []

    const days = []
    const start = new Date(weekData.startOfWeek)

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return days
  }, [weekData])

  // Raggruppa appuntamenti per giorno
  const appuntamentiPerGiorno = useMemo(() => {
    const grouped: { [key: string]: Appuntamento[] } = {}

    weekDays.forEach(day => {
      const dateKey = day.toISOString().split('T')[0]
      grouped[dateKey] = []
    })

    appuntamenti.forEach(app => {
      const date = new Date(app.dataOra)
      const dateKey = date.toISOString().split('T')[0]
      if (grouped[dateKey]) {
        grouped[dateKey].push(app)
      }
    })

    return grouped
  }, [appuntamenti, weekDays])

  const formatDayHeader = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = new Date(date)
    day.setHours(0, 0, 0, 0)

    const isToday = day.getTime() === today.getTime()

    return {
      weekday: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      day: date.getDate(),
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
        return 'bg-blue-100 border-blue-300'
      case 'completato':
        return 'bg-green-100 border-green-300'
      case 'cancellato':
        return 'bg-gray-100 border-gray-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return

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

  if (weekDays.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Errore nel caricamento della settimana</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Vista Settimanale ({totalAppuntamenti} {totalAppuntamenti === 1 ? 'appuntamento' : 'appuntamenti'})
      </h2>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const header = formatDayHeader(day)
          const dateKey = day.toISOString().split('T')[0]
          const dayAppuntamenti = appuntamentiPerGiorno[dateKey] || []

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
              </div>

              {/* Appuntamenti del giorno */}
              <div className="bg-white border border-t-0 rounded-b-lg p-1 space-y-1 min-h-[100px]">
                {dayAppuntamenti.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-1 rounded border text-xs ${getStatoColor(app.stato)} hover:shadow-md transition-shadow`}
                  >
                    <div className="font-semibold truncate">
                      {formatTime(app.dataOra)}
                    </div>
                    <div className="truncate text-gray-700">
                      {app.cliente.cognome}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
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

            {/* Azioni */}
            <div className="space-y-2">
              {selectedApp.stato === 'confermato' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleChangeStato(selectedApp.id, 'completato')}
                    disabled={actioningId === selectedApp.id}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Completa
                  </button>
                  <button
                    onClick={() => handleChangeStato(selectedApp.id, 'cancellato')}
                    disabled={actioningId === selectedApp.id}
                    className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                  >
                    ✕ Cancella
                  </button>
                </div>
              )}

              {selectedApp.stato !== 'confermato' && (
                <button
                  onClick={() => handleChangeStato(selectedApp.id, 'confermato')}
                  disabled={actioningId === selectedApp.id}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Ripristina
                </button>
              )}

              <button
                onClick={() => handleDelete(selectedApp.id)}
                disabled={actioningId === selectedApp.id}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actioningId === selectedApp.id ? 'Eliminazione...' : 'Elimina'}
              </button>

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
