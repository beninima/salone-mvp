'use client'

import { useState } from 'react'
import { updateOperatore } from '@/app/actions/operatori'

const COLORI_PREIMPOSTATI = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Sky Blue
]

type Operatore = {
  id: string
  nome: string
  cognome: string
  colore: string | null
  attivo: boolean
}

export default function OperatoreEditModal({
  operatore,
  onClose,
  onSuccess
}: {
  operatore: Operatore
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [coloreSelezionato, setColoreSelezionato] = useState(operatore.colore || COLORI_PREIMPOSTATI[0])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('colore', coloreSelezionato)
    formData.set('attivo', operatore.attivo.toString())

    const result = await updateOperatore(operatore.id, formData)

    setLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      alert(result.error)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-4 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Modifica Operatore</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={operatore.nome}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cognome *
            </label>
            <input
              type="text"
              name="cognome"
              defaultValue={operatore.cognome}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Colore Agenda
            </label>
            <div className="flex items-center gap-1">
              {/* Preview colore selezionato */}
              <div
                className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: coloreSelezionato }}
              />
              {/* Palette colori inline */}
              <div className="flex flex-wrap gap-1">
                {COLORI_PREIMPOSTATI.map((colore) => (
                  <button
                    key={colore}
                    type="button"
                    onClick={() => setColoreSelezionato(colore)}
                    className={`w-5 h-5 rounded border transition-all ${
                      coloreSelezionato === colore
                        ? 'border-2 border-gray-900 ring-2 ring-offset-1 ring-gray-400'
                        : 'border border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: colore }}
                    title={colore}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
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
    </div>
  )
}
