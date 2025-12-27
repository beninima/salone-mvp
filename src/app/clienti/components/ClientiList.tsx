'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { deleteCliente } from '@/app/actions/clienti'
import ClienteEditForm from './ClienteEditForm'
import ClienteStoriaAppuntamenti from './ClienteStoriaAppuntamenti'

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

export default function ClientiList({ clienti }: { clienti: Cliente[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
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
      <h2 className="text-lg font-semibold text-gray-900">
        {searchQuery ? `Risultati (${clientiFiltrati.length})` : `Lista Clienti (${clientiFiltrati.length})`}
      </h2>

      {clientiFiltrati.map((cliente) => (
        <div key={cliente.id}>
          {editingId === cliente.id ? (
            <ClienteEditForm
              cliente={cliente}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {cliente.nome} {cliente.cognome}
                  </h3>
                  {cliente.cellulare && (
                    <a
                      href={`tel:${cliente.cellulare}`}
                      className="text-blue-600 text-sm block mt-1"
                    >
                      {cliente.cellulare}
                    </a>
                  )}
                  {cliente.note && (
                    <p className="text-gray-600 text-sm mt-2">{cliente.note}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setEditingId(cliente.id)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    disabled={deletingId === cliente.id}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === cliente.id ? 'Elimina...' : 'Elimina'}
                  </button>
                </div>
              </div>

              <ClienteStoriaAppuntamenti
                appuntamenti={cliente.appuntamenti || []}
                interventi={cliente.interventi || []}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
