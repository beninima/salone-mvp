'use client'

import { useState } from 'react'
import { createOperatore } from '@/app/actions/operatori'
import { useRouter } from 'next/navigation'

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

export default function OperatoreForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [coloreSelezionato, setColoreSelezionato] = useState(COLORI_PREIMPOSTATI[0])
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('colore', coloreSelezionato)
    formData.set('attivo', 'true')

    console.log('🚀 Invio dati operatore:', {
      nome: formData.get('nome'),
      cognome: formData.get('cognome'),
      colore: coloreSelezionato
    })

    const result = await createOperatore(formData)

    setLoading(false)

    if (result.success) {
      console.log('✅ Operatore creato con successo!')
      setIsOpen(false)
      e.currentTarget.reset()
      setColoreSelezionato(COLORI_PREIMPOSTATI[0])
      router.refresh()
    } else {
      console.error('❌ Errore creazione:', result.error)
      alert(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700"
      >
        + Aggiungi Operatore
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header con titolo */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900">Nuovo Operatore</h2>
        </div>

        {/* Form compatto in griglia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              required
              placeholder="Mario"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cognome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cognome *
            </label>
            <input
              type="text"
              name="cognome"
              required
              placeholder="Rossi"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Colore */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Colore Agenda *
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
        </div>

        {/* Pulsanti azione inline a destra */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setColoreSelezionato(COLORI_PREIMPOSTATI[0])
            }}
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
