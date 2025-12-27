'use client'

import { useState } from 'react'
import { updateProdotto } from '@/app/actions/prodotti'

type Prodotto = {
  id: number
  nome: string
  descrizione: string | null
  prezzo: number
}

export default function ProdottoEditForm({
  prodotto,
  onCancel
}: {
  prodotto: Prodotto
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProdotto(prodotto.id, formData)

    setLoading(false)

    if (result.success) {
      onCancel()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Modifica Prodotto</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            name="nome"
            defaultValue={prodotto.nome}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            name="descrizione"
            defaultValue={prodotto.descrizione || ''}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prezzo (€) *
          </label>
          <input
            type="number"
            name="prezzo"
            step="0.01"
            min="0"
            defaultValue={prodotto.prezzo}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  )
}
