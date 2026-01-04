'use client'

import { useEffect, useState } from 'react'
import { getServizi, deleteServizio } from '@/app/actions/servizi'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Servizi</h1>
        </div>
        <div className="p-6 text-center text-gray-500">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900">Servizi</h1>
        <p className="text-base text-gray-600">
          {serviziAttivi.length} servizi attivi
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Form */}
        <ServizioForm />

        {/* Servizi List - Compact Layout */}
        {serviziAttivi.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 border-b bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">
                Servizi Attivi ({serviziAttivi.length})
              </h2>
            </div>

            {/* Desktop/Tablet: 4 columns */}
            <div className="hidden md:block">
              {serviziAttivi.map((servizio, index) => (
                <div
                  key={servizio.id}
                  className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors ${
                    index !== serviziAttivi.length - 1 ? 'border-b' : ''
                  }`}
                >
                  {/* Nome Servizio */}
                  <div className="flex-1 font-medium text-gray-900">
                    {servizio.nome}
                  </div>

                  {/* Prezzo */}
                  <div className="w-24 text-right font-semibold text-gray-900">
                    {formatPrezzo(servizio.prezzo)}
                  </div>

                  {/* Durata */}
                  <div className="w-24 text-center text-gray-600">
                    {servizio.durata} min
                  </div>

                  {/* Azioni */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingServizio(servizio)}
                      className="px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors"
                    >
                      Mod
                    </button>
                    <button
                      onClick={() => handleDelete(servizio.id, servizio.nome)}
                      className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
                    >
                      Elim
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: 2 rows layout */}
            <div className="md:hidden">
              {serviziAttivi.map((servizio, index) => (
                <div
                  key={servizio.id}
                  className={`px-6 py-3 hover:bg-gray-50 transition-colors ${
                    index !== serviziAttivi.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Nome + Prezzo */}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{servizio.nome}</div>
                      <div className="font-semibold text-gray-900 text-sm mt-0.5">
                        {formatPrezzo(servizio.prezzo)}
                      </div>
                    </div>

                    {/* Durata + Bottoni */}
                    <div className="flex items-center gap-2">
                      <div className="text-base text-gray-600 whitespace-nowrap">
                        {servizio.durata} min
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingServizio(servizio)}
                          className="px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded font-medium"
                        >
                          Mod
                        </button>
                        <button
                          onClick={() => handleDelete(servizio.id, servizio.nome)}
                          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium"
                        >
                          Elim
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
