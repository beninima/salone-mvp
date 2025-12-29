'use client'

import { useState } from 'react'
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
  operatore: {
    id: string
    nome: string
    cognome: string
    colore: string | null
  }
}

export default function AppuntamentiAgenda({
  appuntamenti
}: {
  appuntamenti: Appuntamento[]
}) {
  const [actioningId, setActioningId] = useState<number | null>(null)
  const router = useRouter()

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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'bg-blue-100 text-blue-800'
      case 'completato':
        return 'bg-green-100 text-green-800'
      case 'cancellato':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (appuntamenti.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Nessun appuntamento per questa data</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Agenda ({appuntamenti.length} {appuntamenti.length === 1 ? 'appuntamento' : 'appuntamenti'})
      </h2>

      {appuntamenti.map((app) => (
        <div
          key={app.id}
          className="bg-white rounded-lg shadow p-4"
          style={{ borderLeft: `4px solid ${app.operatore.colore || '#3B82F6'}` }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-blue-600">
                  {formatTime(app.dataOra)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatoColor(app.stato)}`}>
                  {app.stato}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {app.cliente.cognome} {app.cliente.nome}
              </h3>
              <div className="text-gray-600 text-sm mt-1">
                <p>{app.servizio}</p>
                <p>{app.durata} minuti</p>
                <p className="text-xs mt-1 font-medium" style={{ color: app.operatore.colore || '#3B82F6' }}>
                  Operatore: {app.operatore.cognome} {app.operatore.nome}
                </p>
              </div>
            </div>
          </div>

          {/* Azioni rapide - Small buttons in horizontal row */}
          <div className="flex gap-2 items-center">
            {app.stato === 'confermato' && (
              <>
                <button
                  onClick={() => handleCompleta(app.id)}
                  disabled={actioningId === app.id}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  ✓ Completa
                </button>
                <button
                  onClick={() => handleAnnulla(app.id)}
                  disabled={actioningId === app.id}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  Annulla
                </button>
              </>
            )}

            {app.stato !== 'confermato' && (
              <button
                onClick={() => handleChangeStato(app.id, 'confermato')}
                disabled={actioningId === app.id}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Ripristina
              </button>
            )}

            <button
              onClick={() => handleEliminaDefinitivamente(app.id)}
              disabled={actioningId === app.id}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {actioningId === app.id ? 'Eliminazione...' : 'Elimina definitivamente'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
