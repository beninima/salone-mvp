'use client'

import { useState } from 'react'
import { createIntervento } from '@/app/actions/interventi'
import { useRouter } from 'next/navigation'

type Cliente = {
  id: number
  nome: string
  cognome: string
}

type Prodotto = {
  id: number
  nome: string
  prezzo: number
}

type ProdottoSelezionato = {
  prodottoId: number
  nome: string
  quantita: number
  prezzo: number
}

export default function InterventoForm({
  clienti,
  prodotti
}: {
  clienti: Cliente[]
  prodotti: Prodotto[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [prodottiSelezionati, setProdottiSelezionati] = useState<ProdottoSelezionato[]>([])
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Aggiungi i prodotti selezionati come JSON
    const prodottiData = prodottiSelezionati.map(p => ({
      prodottoId: p.prodottoId,
      quantita: p.quantita
    }))
    formData.append('prodotti', JSON.stringify(prodottiData))

    const result = await createIntervento(formData)

    setLoading(false)

    if (result.success) {
      setIsOpen(false)
      setProdottiSelezionati([])
      e.currentTarget.reset()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const aggiungiProdotto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const prodottoId = parseInt(formData.get('prodottoId') as string)
    const quantita = parseInt(formData.get('quantita') as string)

    if (!prodottoId || !quantita) return

    const prodotto = prodotti.find(p => p.id === prodottoId)
    if (!prodotto) return

    // Controlla se il prodotto è già stato aggiunto
    const esistente = prodottiSelezionati.find(p => p.prodottoId === prodottoId)
    if (esistente) {
      alert('Prodotto già aggiunto')
      return
    }

    setProdottiSelezionati([...prodottiSelezionati, {
      prodottoId,
      nome: prodotto.nome,
      quantita,
      prezzo: prodotto.prezzo
    }])

    e.currentTarget.reset()
  }

  const rimuoviProdotto = (prodottoId: number) => {
    setProdottiSelezionati(prodottiSelezionati.filter(p => p.prodottoId !== prodottoId))
  }

  const totale = prodottiSelezionati.reduce((sum, p) => sum + (p.prezzo * p.quantita), 0)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700"
      >
        + Nuovo Intervento
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Nuovo Intervento</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
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
          <label className="block text-base font-medium text-gray-700 mb-1">
            Data
          </label>
          <input
            type="date"
            name="data"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Descrizione *
          </label>
          <textarea
            name="descrizione"
            required
            rows={3}
            placeholder="Descrivi l'intervento effettuato..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sezione Prodotti */}
        <div className="border-t pt-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Prodotti Utilizzati</h3>

          <form onSubmit={aggiungiProdotto} className="space-y-2 mb-3">
            <div className="flex gap-2">
              <select
                name="prodottoId"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Seleziona prodotto</option>
                {prodotti.map((prodotto) => (
                  <option key={prodotto.id} value={prodotto.id}>
                    {prodotto.nome} (€{prodotto.prezzo.toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantita"
                min="1"
                defaultValue="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Q.tà"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </form>

          {prodottiSelezionati.length > 0 && (
            <div className="space-y-2">
              {prodottiSelezionati.map((p) => (
                <div key={p.prodottoId} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="flex-1">
                    <div className="text-base font-medium">{p.nome}</div>
                    <div className="text-xs text-gray-600">
                      {p.quantita} x €{p.prezzo.toFixed(2)} = €{(p.quantita * p.prezzo).toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => rimuoviProdotto(p.prodottoId)}
                    className="text-red-600 hover:text-red-800 text-base font-medium ml-2"
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
              <div className="text-right font-bold text-gray-900 pt-2 border-t">
                Totale: €{totale.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setProdottiSelezionati([])
            }}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creazione...' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  )
}
