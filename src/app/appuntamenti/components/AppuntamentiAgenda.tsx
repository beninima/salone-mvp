'use client'

import { useState } from 'react'
import { deleteAppuntamento, updateAppuntamentoStato } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'
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
  appuntamenti,
  clienti,
  operatori,
  servizi
}: {
  appuntamenti: Appuntamento[]
  clienti: Cliente[]
  operatori: Operatore[]
  servizi: Servizio[]
}) {
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedApp, setSelectedApp] = useState<Appuntamento | null>(null)
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
      setSelectedApp(null)
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
      <div className="hidden md:block space-y-3">
        {appuntamenti.map((app, index) => (
          <div key={app.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="grid grid-cols-[2fr_1.5fr_1fr_2fr] md:grid-cols-[3fr_2fr_1.5fr_3fr] gap-4 items-center px-6 py-3 hover:bg-gray-50 transition-colors"
              style={{ borderLeft: `4px solid ${app.operatore.colore || '#3B82F6'}` }}
            >
              {/* Cognome Nome */}
              <button
                onClick={() => setSelectedApp(app)}
                className="font-medium text-gray-900 truncate hover:text-blue-600 hover:underline text-left"
              >
                {app.cliente.cognome} {app.cliente.nome}
              </button>

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
              <div>
                <div className="text-base font-medium mb-2" style={{ color: app.operatore.colore || '#3B82F6' }}>
                  {app.operatore.cognome} {app.operatore.nome}
                </div>

                {/* Azioni in una riga */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => router.push(`/clienti/${app.cliente.id}`)}
                    className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    📸 Foto
                  </button>
                  <button
                    onClick={() => setEditingId(editingId === app.id ? null : app.id)}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    ✏ Modifica
                  </button>
                  {app.stato === 'confermato' ? (
                    <>
                      <button
                        onClick={() => handleCompleta(app.id)}
                        disabled={actioningId === app.id}
                        className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        ✓ Completa
                      </button>
                      <button
                        onClick={() => handleAnnulla(app.id)}
                        disabled={actioningId === app.id}
                        className="px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        Annulla
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRipristina(app.id)}
                      disabled={actioningId === app.id}
                      className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      ↻ Ripristina
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminaDefinitivamente(app.id)}
                    disabled={actioningId === app.id}
                    className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actioningId === app.id ? '...' : '🗑 Elimina'}
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {editingId === app.id && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <AppuntamentoEditForm
                  appuntamento={app}
                  clienti={clienti}
                  operatori={operatori}
                  servizi={servizi}
                  onCancel={() => setEditingId(null)}
                  onSuccess={() => setEditingId(null)}
                />
              </div>
            )}
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
                <button
                  onClick={() => setSelectedApp(app)}
                  className="font-semibold text-lg text-gray-900 hover:text-blue-600 hover:underline text-left"
                >
                  {app.cliente.cognome} {app.cliente.nome}
                </button>
                <div className="text-gray-600 text-sm mt-1">
                  <p>{app.servizi.map(s => s.servizio.nome).join(', ')}</p>
                  <p>{app.durata} minuti</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: app.operatore.colore || '#3B82F6' }}>
                    {app.operatore.cognome} {app.operatore.nome}
                  </p>
                </div>
              </div>
            </div>

            {/* Azioni mobile in una riga */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push(`/clienti/${app.cliente.id}`)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                📸 Foto
              </button>
              <button
                onClick={() => setEditingId(editingId === app.id ? null : app.id)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                ✏ Modifica
              </button>
              {app.stato === 'confermato' ? (
                <>
                  <button
                    onClick={() => handleCompleta(app.id)}
                    disabled={actioningId === app.id}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Completa
                  </button>
                  <button
                    onClick={() => handleAnnulla(app.id)}
                    disabled={actioningId === app.id}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleRipristina(app.id)}
                  disabled={actioningId === app.id}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  ↻ Ripristina
                </button>
              )}
              <button
                onClick={() => handleEliminaDefinitivamente(app.id)}
                disabled={actioningId === app.id}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actioningId === app.id ? '...' : '🗑 Elimina'}
              </button>
            </div>

            {/* Edit Form for mobile */}
            {editingId === app.id && (
              <div className="mt-4 pt-4 border-t">
                <AppuntamentoEditForm
                  appuntamento={app}
                  clienti={clienti}
                  operatori={operatori}
                  servizi={servizi}
                  onCancel={() => setEditingId(null)}
                  onSuccess={() => setEditingId(null)}
                />
              </div>
            )}
          </div>
        ))}
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
                  onClick={() => handleEliminaDefinitivamente(selectedApp.id)}
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
