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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
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
        Agenda ({appuntamenti.length})
      </h2>

      {/* Desktop/Tablet: Compact row layout */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {appuntamenti.map((app, index) => (
          <div
            key={app.id}
            className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${
              index !== appuntamenti.length - 1 ? 'border-b' : ''
            }`}
            style={{ borderLeft: `4px solid ${app.operatore.colore || '#3B82F6'}` }}
          >
            {/* Cognome Nome */}
            <div className="w-40 font-medium text-gray-900">
              {app.cliente.cognome} {app.cliente.nome}
            </div>

            {/* Servizio */}
            <div className="w-32 text-sm text-gray-700">
              {app.servizio}
            </div>

            {/* Tempo (Ora + Durata) */}
            <div className="w-28 text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatTime(app.dataOra)}
              </div>
              <div className="text-xs text-gray-500">
                {app.durata} min
              </div>
            </div>

            {/* Operatore */}
            <div className="flex-1 text-sm font-medium" style={{ color: app.operatore.colore || '#3B82F6' }}>
              {app.operatore.cognome} {app.operatore.nome}
            </div>

            {/* Azioni */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/clienti/${app.cliente.id}`)}
                className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                📸 Foto
              </button>

              {app.stato !== 'confermato' && (
                <button
                  onClick={() => handleRipristina(app.id)}
                  disabled={actioningId === app.id}
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                >
                  Ripristina
                </button>
              )}

              {app.stato === 'confermato' && (
                <>
                  <button
                    onClick={() => handleCompleta(app.id)}
                    disabled={actioningId === app.id}
                    className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                  >
                    Completa
                  </button>
                  <button
                    onClick={() => handleAnnulla(app.id)}
                    disabled={actioningId === app.id}
                    className="px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </>
              )}

              <button
                onClick={() => handleEliminaDefinitivamente(app.id)}
                disabled={actioningId === app.id}
                className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                {actioningId === app.id ? '...' : 'Elim'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {appuntamenti.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow p-4"
            style={{ borderLeft: `4px solid ${app.operatore.colore || '#3B82F6'}` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatTime(app.dataOra)}
                </div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {app.cliente.cognome} {app.cliente.nome}
                </h3>
                <div className="text-gray-600 text-sm mt-1">
                  <p>{app.servizio}</p>
                  <p>{app.durata} minuti</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: app.operatore.colore || '#3B82F6' }}>
                    {app.operatore.cognome} {app.operatore.nome}
                  </p>
                </div>
              </div>
            </div>

            {/* Azioni mobile */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push(`/clienti/${app.cliente.id}`)}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
              >
                📸 Foto
              </button>

              {app.stato !== 'confermato' && (
                <button
                  onClick={() => handleRipristina(app.id)}
                  disabled={actioningId === app.id}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  Ripristina
                </button>
              )}

              {app.stato === 'confermato' && (
                <>
                  <button
                    onClick={() => handleCompleta(app.id)}
                    disabled={actioningId === app.id}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 disabled:opacity-50"
                  >
                    Completa
                  </button>
                  <button
                    onClick={() => handleAnnulla(app.id)}
                    disabled={actioningId === app.id}
                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </>
              )}

              <button
                onClick={() => handleEliminaDefinitivamente(app.id)}
                disabled={actioningId === app.id}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {actioningId === app.id ? '...' : 'Elim'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
