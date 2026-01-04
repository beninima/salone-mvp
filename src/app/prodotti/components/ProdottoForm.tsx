'use client'

import { useState } from 'react'
import { createProdotto } from '@/app/actions/prodotti'

export default function ProdottoForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createProdotto(formData)

    setLoading(false)

    if (result.success) {
      setIsOpen(false)
      e.currentTarget.reset()
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700"
      >
        + Aggiungi Prodotto
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Nuovo Prodotto</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            name="nome"
            required
            placeholder="es. Shampoo Riparatore"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            name="descrizione"
            rows={2}
            placeholder="Descrizione opzionale..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Prezzo (€) *
          </label>
          <input
            type="number"
            name="prezzo"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  )
}
