'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { getOperatori, toggleOperatoreAttivo, deleteOperatore } from '@/app/actions/operatori'
import OperatoreForm from './components/OperatoreForm'
import OperatoreEditModal from './components/OperatoreEditModal'
import { useRouter } from 'next/navigation'

type Operatore = {
  id: string
  nome: string
  cognome: string
  colore: string | null
  attivo: boolean
}

export default function OperatoriPage() {
  const [operatori, setOperatori] = useState<Operatore[]>([])
  const [loading, setLoading] = useState(true)
  const [editingOperatore, setEditingOperatore] = useState<Operatore | null>(null)
  const router = useRouter()

  const loadOperatori = async () => {
    setLoading(true)
    const result = await getOperatori()
    setOperatori(result.success ? result.data : [])
    setLoading(false)
  }

  useEffect(() => {
    loadOperatori()
  }, [])

  const handleToggleAttivo = async (id: string, attivo: boolean) => {
    const result = await toggleOperatoreAttivo(id, !attivo)
    if (result.success) {
      await loadOperatori()
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (id: string, nomeCompleto: string) => {
    if (!confirm(`Sei sicuro di voler eliminare ${nomeCompleto}?`)) return

    const result = await deleteOperatore(id)
    if (result.success) {
      await loadOperatori()
    } else {
      alert(result.error)
    }
  }

  const operatoriAttivi = operatori.filter(op => op.attivo)
  const operatoriDisattivati = operatori.filter(op => !op.attivo)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Ottimizzato */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Operatori</h1>
              <p className="text-sm text-blue-100 mt-1">
                {operatoriAttivi.length} {operatoriAttivi.length === 1 ? 'attivo' : 'attivi'} · {operatori.length} totali
              </p>
            </div>

            {/* Legenda Colori - visibile solo se ci sono operatori */}
            {operatoriAttivi.length > 0 && (
              <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-xs font-medium text-blue-100">Legenda:</span>
                {operatoriAttivi.slice(0, 4).map((op) => (
                  <div key={op.id} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: op.colore || '#3B82F6' }}
                    />
                    <span className="text-xs font-medium">{op.cognome}</span>
                  </div>
                ))}
                {operatoriAttivi.length > 4 && (
                  <span className="text-xs text-blue-200">+{operatoriAttivi.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo operatore */}
        <OperatoreForm onOperatoreCreated={loadOperatori} />

        {/* Lista operatori attivi */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Caricamento...</p>
          </div>
        ) : (
          <>
            {operatoriAttivi.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 px-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded"></span>
                  Operatori Attivi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {operatoriAttivi.map((operatore) => (
                    <div key={operatore.id}>
                      {editingOperatore?.id === operatore.id ? (
                        <OperatoreEditModal
                          operatore={operatore}
                          onClose={() => setEditingOperatore(null)}
                          onSuccess={() => {
                            setEditingOperatore(null)
                            loadOperatori()
                          }}
                        />
                      ) : (
                        <div
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 border-l-4"
                          style={{ borderLeftColor: operatore.colore || '#3B82F6' }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-md"
                                style={{ backgroundColor: operatore.colore || '#3B82F6' }}
                              >
                                {operatore.cognome.charAt(0)}{operatore.nome.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-xl text-gray-900">
                                  {operatore.cognome} {operatore.nome}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: operatore.colore || '#3B82F6' }}
                                  />
                                  <p className="text-base text-gray-500 font-mono">
                                    {operatore.colore || '#3B82F6'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingOperatore(operatore)}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              ✏️ Modifica
                            </button>
                            <button
                              onClick={() => handleDelete(operatore.id, `${operatore.cognome} ${operatore.nome}`)}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                            >
                              🗑 Elimina
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {operatoriDisattivati.length > 0 && (
              <div className="space-y-2 pt-4">
                <h2 className="text-2xl font-semibold text-gray-500 px-2">Operatori Disattivati</h2>
                {operatoriDisattivati.map((operatore) => (
                  <div
                    key={operatore.id}
                    className="bg-gray-100 rounded-lg shadow p-6 opacity-60"
                    style={{ borderLeft: `4px solid ${operatore.colore || '#9CA3AF'}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: operatore.colore || '#9CA3AF' }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl text-gray-700">
                            {operatore.cognome} {operatore.nome}
                          </h3>
                          <p className="text-base text-gray-500">Disattivato</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAttivo(operatore.id, operatore.attivo)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Riattiva
                        </button>
                        <button
                          onClick={() => handleDelete(operatore.id, `${operatore.cognome} ${operatore.nome}`)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {operatori.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Nessun operatore presente. Aggiungi il primo operatore!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
