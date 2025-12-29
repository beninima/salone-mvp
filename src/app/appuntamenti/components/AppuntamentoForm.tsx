'use client'

import { useState } from 'react'
import { createAppuntamento } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'

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

const SERVIZI = [
  'Taglio',
  'Piega',
  'Colore',
  'Mèches',
  'Trattamento',
  'Taglio + Piega',
  'Taglio + Colore',
  'Altro'
]

export default function AppuntamentoForm({
  clienti,
  operatori,
  selectedDate
}: {
  clienti: Cliente[]
  operatori: Operatore[]
  selectedDate: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createAppuntamento(formData)

    setLoading(false)

    if (result.success) {
      setIsOpen(false)
      e.currentTarget.reset()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700"
      >
        + Nuovo Appuntamento
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Nuovo Appuntamento</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            name="clienteId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona cliente</option>
            {clienti.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.cognome} {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operatore *
          </label>
          <select
            name="operatoreId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona operatore</option>
            {operatori.map((operatore) => (
              <option key={operatore.id} value={operatore.id}>
                {operatore.cognome} {operatore.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data *
          </label>
          <input
            type="date"
            name="data"
            defaultValue={selectedDate}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ora *
          </label>
          <input
            type="time"
            name="ora"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Servizio *
          </label>
          <select
            name="servizio"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona servizio</option>
            {SERVIZI.map((servizio) => (
              <option key={servizio} value={servizio}>
                {servizio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durata (minuti) *
          </label>
          <select
            name="durata"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona durata</option>
            <option value="30">30 minuti</option>
            <option value="45">45 minuti</option>
            <option value="60">1 ora</option>
            <option value="90">1 ora e 30</option>
            <option value="120">2 ore</option>
            <option value="150">2 ore e 30</option>
            <option value="180">3 ore</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creazione...' : 'Crea'}
          </button>
        </div>
      </form>
    </div>
  )
}
