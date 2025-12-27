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
}

export default function AppuntamentiAgenda({
  appuntamenti
}: {
  appuntamenti: Appuntamento[]
}) {
  const [actioningId, setActioningId] = useState<number | null>(null)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return

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
        <div key={app.id} className="bg-white rounded-lg shadow p-4">
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
              </div>
            </div>
          </div>

          {/* Azioni rapide */}
          {app.stato === 'confermato' && (
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => handleChangeStato(app.id, 'completato')}
                disabled={actioningId === app.id}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                ✓ Completa
              </button>
              <button
                onClick={() => handleChangeStato(app.id, 'cancellato')}
                disabled={actioningId === app.id}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                ✕ Cancella
              </button>
            </div>
          )}

          {app.stato !== 'confermato' && (
            <button
              onClick={() => handleChangeStato(app.id, 'confermato')}
              disabled={actioningId === app.id}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mb-2"
            >
              Ripristina
            </button>
          )}

          <button
            onClick={() => handleDelete(app.id)}
            disabled={actioningId === app.id}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {actioningId === app.id ? 'Eliminazione...' : 'Elimina'}
          </button>
        </div>
      ))}
    </div>
  )
}
