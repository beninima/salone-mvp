'use client'

import { useState } from 'react'
import { createCliente } from '@/app/actions/clienti'

type Cliente = {
  id: number
  nome: string
  cognome: string
}

type NuovoClienteModalProps = {
  isOpen: boolean
  onClose: () => void
  onClienteCreated: (cliente: Cliente) => void
}

export default function NuovoClienteModal({ isOpen, onClose, onClienteCreated }: NuovoClienteModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createCliente(formData)

    setLoading(false)

    if (result.success) {
      // Call the callback with the new client data
      if (result.data?.id) {
        const newCliente = {
          id: result.data.id,
          nome: formData.get('nome') as string,
          cognome: formData.get('cognome') as string
        }
        onClienteCreated(newCliente)
      }
      onClose()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Nuovo Cliente</h1>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
            >
              ✕ Annulla
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Cognome *
              </label>
              <input
                type="text"
                name="cognome"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Cellulare
              </label>
              <input
                type="tel"
                name="cellulare"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                name="note"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
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
        </div>
      </div>
    </div>
  )
}
