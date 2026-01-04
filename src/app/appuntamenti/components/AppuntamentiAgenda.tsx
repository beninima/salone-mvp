'use client'

import { useState } from 'react'
import { deleteAppuntamento, updateAppuntamentoStato } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'
import ManageServicesModal from './ManageServicesModal'

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
  operatore: {
    id: string
    nome: string
    cognome: string
    colore: string | null
  }
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

export default function AppuntamentiAgenda({
  appuntamenti
}: {
  appuntamenti: Appuntamento[]
}) {
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [managingServicesApp, setManagingServicesApp] = useState<Appuntamento | null>(null)
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
      <h2 className="text-2xl font-semibold text-gray-900">
        Agenda ({appuntamenti.length})
      </h2>

      {/* Desktop/Tablet: Compact grid layout */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {appuntamenti.map((app, index) => (
          <div
            key={app.id}
            className={`grid grid-cols-[2fr_1.5fr_1fr_2fr] md:grid-cols-[3fr_2fr_1.5fr_3fr] gap-4 items-center px-6 py-3 hover:bg-gray-50 transition-colors ${
              index !== appuntamenti.length - 1 ? 'border-b' : ''
            }`}
            style={{ borderLeft: `4px solid ${app.operatore.colore || '#3B82F6'}` }}
          >
            {/* Cognome Nome */}
            <div className="font-medium text-gray-900 truncate">
              {app.cliente.cognome} {app.cliente.nome}
            </div>

            {/* Servizi */}
            <div className="text-sm text-gray-700 truncate">
              {app.servizi.map(s => s.servizio.nome).join(', ')}
            </div>

            {/* Tempo (Ora + Durata) */}
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatTime(app.dataOra)}
              </div>
              <div className="text-xs text-gray-500">
                {app.durata} min
              </div>
            </div>

            {/* Operatore + Azioni */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-medium truncate" style={{ color: app.operatore.colore || '#3B82F6' }}>
                {app.operatore.cognome} {app.operatore.nome}
              </div>

              {/* Azioni */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setManagingServicesApp(app)}
                  className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition-colors"
                  title="Gestisci Servizi"
                >
                  ⚙️
                </button>

                <button
                  onClick={() => router.push(`/clienti/${app.cliente.id}`)}
                  className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                  title="Foto"
                >
                  📸
                </button>

                {app.stato !== 'confermato' && (
                  <button
                    onClick={() => handleRipristina(app.id)}
                    disabled={actioningId === app.id}
                    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                    title="Ripristina"
                  >
                    ↻
                  </button>
                )}

                {app.stato === 'confermato' && (
                  <>
                    <button
                      onClick={() => handleCompleta(app.id)}
                      disabled={actioningId === app.id}
                      className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                      title="Completa"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleAnnulla(app.id)}
                      disabled={actioningId === app.id}
                      className="px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                      title="Annulla"
                    >
                      ✕
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleEliminaDefinitivamente(app.id)}
                  disabled={actioningId === app.id}
                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                  title="Elimina definitivamente"
                >
                  {actioningId === app.id ? '⋯' : '🗑'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {appuntamenti.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow p-6"
            style={{ borderLeft: `4px solid ${app.operatore.colore || '#3B82F6'}` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatTime(app.dataOra)}
                </div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {app.cliente.cognome} {app.cliente.nome}
                </h3>
                <div className="text-gray-600 text-sm mt-1">
                  <p>{app.servizi.map(s => s.servizio.nome).join(', ')}</p>
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
                onClick={() => setManagingServicesApp(app)}
                className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600"
              >
                ⚙️ Servizi
              </button>

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

      {/* Manage Services Modal */}
      {managingServicesApp && (
        <ManageServicesModal
          appuntamentoId={managingServicesApp.id}
          currentServices={managingServicesApp.servizi}
          onClose={() => setManagingServicesApp(null)}
          onSuccess={() => {
            setManagingServicesApp(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
