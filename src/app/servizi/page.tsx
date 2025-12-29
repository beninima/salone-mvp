'use client'

import { useEffect, useState } from 'react'
import { getServizi, toggleServizioAttivo, deleteServizio } from '@/app/actions/servizi'
import ServizioForm from './components/ServizioForm'
import ServizioEditModal from './components/ServizioEditModal'

type Servizio = {
  id: string
  nome: string
  prezzo: number
  durata: number
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ServiziPage() {
  const [servizi, setServizi] = useState<Servizio[]>([])
  const [editingServizio, setEditingServizio] = useState<Servizio | null>(null)
  const [loading, setLoading] = useState(true)

  const loadServizi = async () => {
    const result = await getServizi()
    if (result.success) {
      setServizi(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadServizi()
  }, [])

  const handleToggleAttivo = async (id: string, attivo: boolean) => {
    const result = await toggleServizioAttivo(id, !attivo)
    if (result.success) {
      loadServizi()
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Eliminare il servizio "${nome}"?`)) return

    const result = await deleteServizio(id)
    if (result.success) {
      loadServizi()
    } else {
      alert(result.error)
    }
  }

  const formatPrezzo = (prezzo: number) => {
    return `€${prezzo.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const serviziAttivi = servizi.filter(s => s.attivo)
  const serviziDisattivati = servizi.filter(s => !s.attivo)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
          <h1 className="text-2xl font-bold text-gray-900">Servizi</h1>
        </div>
        <div className="p-4 text-center text-gray-500">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Servizi</h1>
        <p className="text-sm text-gray-600">
          {serviziAttivi.length} servizi attivi
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Form */}
        <ServizioForm />

        {/* Servizi Attivi */}
        {serviziAttivi.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Servizi Attivi</h2>
            {serviziAttivi.map((servizio) => (
              <div
                key={servizio.id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {servizio.nome}
                    </h3>
                    <div className="text-gray-600 text-sm mt-1 space-y-0.5">
                      <p className="font-bold text-green-700 text-base">
                        {formatPrezzo(servizio.prezzo)}
                      </p>
                      <p>{servizio.durata} minuti</p>
                    </div>
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingServizio(servizio)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleToggleAttivo(servizio.id, servizio.attivo)}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition-colors"
                  >
                    Disattiva
                  </button>
                  <button
                    onClick={() => handleDelete(servizio.id, servizio.nome)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Servizi Disattivati */}
        {serviziDisattivati.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-500">
              Servizi Disattivati ({serviziDisattivati.length})
            </h2>
            {serviziDisattivati.map((servizio) => (
              <div
                key={servizio.id}
                className="bg-gray-50 rounded-lg shadow p-4 border-l-4 border-gray-400 opacity-75"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-600">
                      {servizio.nome}
                    </h3>
                    <div className="text-gray-500 text-sm mt-1 space-y-0.5">
                      <p className="font-bold text-base">
                        {formatPrezzo(servizio.prezzo)}
                      </p>
                      <p>{servizio.durata} minuti</p>
                    </div>
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAttivo(servizio.id, servizio.attivo)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    Riattiva
                  </button>
                  <button
                    onClick={() => handleDelete(servizio.id, servizio.nome)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {servizi.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Nessun servizio disponibile</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingServizio && (
        <ServizioEditModal
          servizio={editingServizio}
          onClose={() => setEditingServizio(null)}
          onSuccess={() => {
            setEditingServizio(null)
            loadServizi()
          }}
        />
      )}
    </div>
  )
}
