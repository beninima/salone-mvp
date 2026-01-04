'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { deleteCliente } from '@/app/actions/clienti'
import ClienteEditForm from './ClienteEditForm'

type Prodotto = {
  id: number
  nome: string
}

type InterventoProdotto = {
  quantita: number
  prodotto: Prodotto
}

type Intervento = {
  id: number
  descrizione: string
  data: Date
  prodotti: InterventoProdotto[]
}

type Appuntamento = {
  id: number
  dataOra: Date
  servizio: string
  durata: number
  stato: string
}

type Cliente = {
  id: number
  nome: string
  cognome: string
  cellulare: string | null
  note: string | null
  appuntamenti?: Appuntamento[]
  interventi?: Intervento[]
}

export default function ClientiList({ clienti, onClienteUpdated }: { clienti: Cliente[], onClienteUpdated?: () => void }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  // Filtra i clienti in base alla query di ricerca
  const clientiFiltrati = useMemo(() => {
    if (!searchQuery.trim()) return clienti

    const query = searchQuery.toLowerCase()
    return clienti.filter(cliente =>
      cliente.nome.toLowerCase().includes(query) ||
      cliente.cognome.toLowerCase().includes(query) ||
      cliente.cellulare?.toLowerCase().includes(query)
    )
  }, [clienti, searchQuery])

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return

    setDeletingId(id)
    const result = await deleteCliente(id)
    setDeletingId(null)

    if (!result.success) {
      alert(result.error)
    }
  }

  const getAppuntamentiCount = (cliente: Cliente) => {
    return (cliente.appuntamenti || []).length
  }

  if (clientiFiltrati.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">
          {searchQuery ? 'Nessun cliente trovato per questa ricerca' : 'Nessun cliente presente'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-gray-900">
        {searchQuery ? `Risultati (${clientiFiltrati.length})` : `Lista Clienti (${clientiFiltrati.length})`}
      </h2>

      {/* Desktop/Tablet: Compact row layout */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {clientiFiltrati.map((cliente, index) => (
          <div key={cliente.id}>
            {editingId === cliente.id ? (
              <div className="p-6 border-b">
                <ClienteEditForm
                  cliente={cliente}
                  onCancel={() => setEditingId(null)}
                  onSuccess={onClienteUpdated}
                />
              </div>
            ) : (
              <div
                className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors ${
                  index !== clientiFiltrati.length - 1 ? 'border-b' : ''
                }`}
              >
                {/* Cognome Nome */}
                <div className="w-48 font-medium text-gray-900">
                  {cliente.cognome} {cliente.nome}
                </div>

                {/* Telefono */}
                <div className="w-32">
                  {cliente.cellulare ? (
                    <a
                      href={`tel:${cliente.cellulare}`}
                      className="text-blue-600 hover:underline text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cliente.cellulare}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </div>

                {/* Storia Appuntamenti Link */}
                <div className="flex-1">
                  <button
                    onClick={() => setExpandedId(expandedId === cliente.id ? null : cliente.id)}
                    className="text-base text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    📋 Storia ({getAppuntamentiCount(cliente)})
                  </button>
                </div>

                {/* Azioni */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/clienti/${cliente.id}`)}
                    className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                  >
                    📸 Foto
                  </button>
                  <button
                    onClick={() => setEditingId(cliente.id)}
                    className="px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors"
                  >
                    Mod
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    disabled={deletingId === cliente.id}
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingId === cliente.id ? '...' : 'Elim'}
                  </button>
                </div>
              </div>
            )}

            {/* Expanded Storia - below row */}
            {expandedId === cliente.id && editingId !== cliente.id && (
              <div className="px-6 py-3 bg-gray-50 border-b">
                <div className="text-sm">
                  {cliente.appuntamenti && cliente.appuntamenti.length > 0 ? (
                    <div className="space-y-2">
                      {cliente.appuntamenti.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            {new Date(app.dataOra).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </span>
                          <span className="text-gray-900 font-medium">{app.servizio}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            app.stato === 'completato' ? 'bg-green-100 text-green-700' :
                            app.stato === 'confermato' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {app.stato}
                          </span>
                        </div>
                      ))}
                      {cliente.appuntamenti.length > 5 && (
                        <p className="text-xs text-gray-500 italic">
                          ...e altri {cliente.appuntamenti.length - 5} appuntamenti
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Nessun appuntamento registrato</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {clientiFiltrati.map((cliente) => (
          <div key={cliente.id}>
            {editingId === cliente.id ? (
              <div className="bg-white rounded-lg shadow p-6">
                <ClienteEditForm
                  cliente={cliente}
                  onCancel={() => setEditingId(null)}
                  onSuccess={onClienteUpdated}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {cliente.cognome} {cliente.nome}
                    </h3>
                    {cliente.cellulare && (
                      <a
                        href={`tel:${cliente.cellulare}`}
                        className="text-blue-600 text-sm block mt-1"
                      >
                        {cliente.cellulare}
                      </a>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === cliente.id ? null : cliente.id)}
                      className="text-base text-gray-600 mt-1"
                    >
                      📋 Storia ({getAppuntamentiCount(cliente)})
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/clienti/${cliente.id}`)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
                  >
                    📸 Foto
                  </button>
                  <button
                    onClick={() => setEditingId(cliente.id)}
                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600"
                  >
                    Mod
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    disabled={deletingId === cliente.id}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {deletingId === cliente.id ? '...' : 'Elim'}
                  </button>
                </div>

                {/* Expanded Storia - mobile */}
                {expandedId === cliente.id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm">
                      {cliente.appuntamenti && cliente.appuntamenti.length > 0 ? (
                        <div className="space-y-2">
                          {cliente.appuntamenti.slice(0, 3).map((app) => (
                            <div key={app.id} className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-600">
                                  {new Date(app.dataOra).toLocaleDateString('it-IT')}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  app.stato === 'completato' ? 'bg-green-100 text-green-700' :
                                  app.stato === 'confermato' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {app.stato}
                                </span>
                              </div>
                              <div className="text-gray-900 font-medium">{app.servizio}</div>
                            </div>
                          ))}
                          {cliente.appuntamenti.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              ...e altri {cliente.appuntamenti.length - 3}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Nessun appuntamento</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
