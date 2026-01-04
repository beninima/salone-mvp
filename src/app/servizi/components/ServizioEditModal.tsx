'use client'

import { useState } from 'react'
import { updateServizio } from '@/app/actions/servizi'

type Servizio = {
  id: string
  nome: string
  prezzo: number
  durata: number
  attivo: boolean
}

export default function ServizioEditModal({
  servizio,
  onClose,
  onSuccess
}: {
  servizio: Servizio
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('attivo', servizio.attivo.toString())

    const result = await updateServizio(servizio.id, formData)

    setLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header con titolo */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900">Modifica Servizio</h2>
        </div>

        {/* Form compatto in griglia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome Servizio *
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={servizio.nome}
              required
              placeholder="Taglio"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prezzo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Prezzo (€) *
            </label>
            <input
              type="number"
              name="prezzo"
              defaultValue={servizio.prezzo}
              required
              min="0"
              step="0.01"
              placeholder="25.00"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Durata */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Durata (min) *
            </label>
            <input
              type="number"
              name="durata"
              defaultValue={servizio.durata}
              required
              min="15"
              max="240"
              step="1"
              placeholder="60"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pulsanti azione inline a destra */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300"
          >
            ✕ Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '⏳ Salvataggio...' : '💾 Salva'}
          </button>
        </div>
      </form>
    </div>
  )
}
