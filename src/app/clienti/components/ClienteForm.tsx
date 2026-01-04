'use client'

import { useState } from 'react'
import { createCliente } from '@/app/actions/clienti'
import { useRouter } from 'next/navigation'

type ClienteFormProps = {
  returnTo?: string
  onClienteCreated?: () => void
}

export default function ClienteForm({ returnTo, onClienteCreated }: ClienteFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createCliente(formData)

    setLoading(false)

    if (result.success) {
      // Reload clients list FIRST, before closing the form
      if (onClienteCreated) {
        await onClienteCreated()
      }

      // Then close the form and reset
      setIsOpen(false)
      e.currentTarget.reset()

      // If returnTo is provided, redirect there after a short delay
      if (returnTo) {
        setTimeout(() => {
          router.push(returnTo)
        }, 100)
      }
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
        style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}
      >
        + Aggiungi Cliente
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Nuovo Cliente</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Cognome *
          </label>
          <input
            type="text"
            name="cognome"
            required
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
