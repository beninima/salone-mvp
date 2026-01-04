'use client'

import { useEffect, useState } from 'react'
import { getServizi, deleteServizio } from '@/app/actions/servizi'
import ServizioForm from './components/ServizioForm'
import ServizioEditModal from './components/ServizioEditModal'
import { Check, Edit, Trash2 } from 'lucide-react'

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
  const totalePrezzi = serviziAttivi.reduce((sum, s) => sum + s.prezzo, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center text-gray-500">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-xl border overflow-hidden">

        {/* HEADER GRADIENT */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 sm:p-5 md:p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black">Servizi & Prezzi</h1>
              <p className="text-emerald-100 mt-1 text-sm sm:text-base">Gestione completa listino prezzi</p>
            </div>
            <ServizioForm onServizioCreated={loadServizi} />
          </div>
        </div>

        {/* TABELLA CARD-STYLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="p-2 sm:p-3 md:p-4 text-left font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider w-2/5">Servizio</th>
                <th className="p-2 sm:p-3 md:p-4 text-center font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider w-1/5">Durata Standard</th>
                <th className="p-2 sm:p-3 md:p-4 text-right font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider w-1/5">Prezzo Standard</th>
                <th className="p-2 sm:p-3 md:p-4 text-center font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider w-1/5">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviziAttivi.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nessun servizio disponibile. Aggiungi il primo servizio!
                  </td>
                </tr>
              ) : (
                serviziAttivi.map((servizio) => (
                  editingServizio?.id === servizio.id ? (
                    <tr key={servizio.id}>
                      <td colSpan={4} className="p-6 bg-gray-50">
                        <ServizioEditModal
                          servizio={servizio}
                          onClose={() => setEditingServizio(null)}
                          onSuccess={() => {
                            setEditingServizio(null)
                            loadServizi()
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={servizio.id} className="group hover:bg-emerald-50/50 transition-all cursor-pointer border-b hover:border-emerald-200">
                      <td className="p-2 sm:p-3 md:p-4 font-semibold text-xl text-gray-900 group-hover:text-emerald-800">{servizio.nome}</td>
                      <td className="p-2 sm:p-3 md:p-4 text-center text-xl text-gray-600">{servizio.durata} min</td>
                      <td className="p-2 sm:p-3 md:p-4 text-right font-bold text-2xl text-emerald-600">{formatPrezzo(servizio.prezzo)}</td>
                      <td className="p-2 sm:p-3 md:p-4">
                        <div className="flex gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() => setEditingServizio(servizio)}
                            className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-xl group-hover:scale-105 transition-all"
                            title="Modifica"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(servizio.id, servizio.nome)}
                            className="p-1.5 sm:p-2 hover:bg-red-100 rounded-xl group-hover:scale-105 transition-all"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
