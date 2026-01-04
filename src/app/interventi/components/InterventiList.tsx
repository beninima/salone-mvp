'use client'

import { useState } from 'react'
import { deleteIntervento } from '@/app/actions/interventi'
import { useRouter } from 'next/navigation'

type Intervento = {
  id: number
  data: Date
  descrizione: string
  cliente: {
    id: number
    nome: string
    cognome: string
  }
  prodotti: Array<{
    quantita: number
    prodotto: {
      id: number
      nome: string
      prezzo: number
    }
  }>
}

export default function InterventiList({ interventi }: { interventi: Intervento[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo intervento?')) return

    setDeletingId(id)
    const result = await deleteIntervento(id)
    setDeletingId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const calcolaTotale = (intervento: Intervento) => {
    return intervento.prodotti.reduce(
      (sum, p) => sum + (p.prodotto.prezzo * p.quantita),
      0
    )
  }

  if (interventi.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Nessun intervento registrato</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-gray-900">
        Storico Interventi ({interventi.length})
      </h2>

      {interventi.map((intervento) => {
        const totale = calcolaTotale(intervento)

        return (
          <div key={intervento.id} className="bg-white rounded-lg shadow p-6">
            <div className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {intervento.cliente.cognome} {intervento.cliente.nome}
                </h3>
                <span className="text-base text-gray-600">
                  {formatDate(intervento.data)}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-2">{intervento.descrizione}</p>
            </div>

            {intervento.prodotti.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Prodotti Utilizzati
                </h4>
                <div className="space-y-1">
                  {intervento.prodotti.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {p.quantita}x {p.prodotto.nome}
                      </span>
                      <span className="text-gray-900 font-medium">
                        €{(p.prodotto.prezzo * p.quantita).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t mt-2">
                    <span>Totale</span>
                    <span>€{totale.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => handleDelete(intervento.id)}
              disabled={deletingId === intervento.id}
              className="w-full mt-3 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId === intervento.id ? 'Eliminazione...' : 'Elimina'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
