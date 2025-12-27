'use client'

import { useState } from 'react'
import { deleteProdotto } from '@/app/actions/prodotti'
import ProdottoEditForm from './ProdottoEditForm'

type Prodotto = {
  id: number
  nome: string
  descrizione: string | null
  prezzo: number
}

export default function ProdottiList({ prodotti }: { prodotti: Prodotto[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return

    setDeletingId(id)
    const result = await deleteProdotto(id)
    setDeletingId(null)

    if (!result.success) {
      alert(result.error)
    }
  }

  if (prodotti.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Nessun prodotto presente</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Catalogo Prodotti ({prodotti.length})
      </h2>

      {prodotti.map((prodotto) => (
        <div key={prodotto.id}>
          {editingId === prodotto.id ? (
            <ProdottoEditForm
              prodotto={prodotto}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {prodotto.nome}
                  </h3>
                  {prodotto.descrizione && (
                    <p className="text-gray-600 text-sm mt-1">{prodotto.descrizione}</p>
                  )}
                  <div className="text-blue-600 font-bold text-xl mt-2">
                    € {prodotto.prezzo.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditingId(prodotto.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Modifica
                </button>
                <button
                  onClick={() => handleDelete(prodotto.id)}
                  disabled={deletingId === prodotto.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === prodotto.id ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
