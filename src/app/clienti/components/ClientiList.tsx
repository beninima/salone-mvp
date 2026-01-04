'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { deleteCliente } from '@/app/actions/clienti'
import ClienteEditForm from './ClienteEditForm'
import { Camera, Edit, Trash2, Phone, History } from 'lucide-react'

type Prodotto = {
  id: number
  nome: string
}

type InterventoProdotto = {
  quantita: number
  prodotto: Prodotto
}

type Intervento = {
  id: number
  descrizione: string
  data: Date
  prodotti: InterventoProdotto[]
}

type Appuntamento = {
  id: number
  dataOra: Date
  servizio: string
  durata: number
  stato: string
}

type Cliente = {
  id: number
  nome: string
  cognome: string
  cellulare: string | null
  note: string | null
  appuntamenti?: Appuntamento[]
  interventi?: Intervento[]
}

export default function ClientiList({ clienti, onClienteUpdated }: { clienti: Cliente[], onClienteUpdated?: () => void }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  // Filtra i clienti in base alla query di ricerca
  const clientiFiltrati = useMemo(() => {
    if (!searchQuery.trim()) return clienti

    const query = searchQuery.toLowerCase()
    return clienti.filter(cliente =>
      cliente.nome.toLowerCase().includes(query) ||
      cliente.cognome.toLowerCase().includes(query) ||
      cliente.cellulare?.toLowerCase().includes(query)
    )
  }, [clienti, searchQuery])

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return

    setDeletingId(id)
    const result = await deleteCliente(id)
    setDeletingId(null)

    if (result.success) {
      // Reload the client list
      if (onClienteUpdated) {
        onClienteUpdated()
      }
    } else {
      alert(result.error)
    }
  }

  const getAppuntamentiCount = (cliente: Cliente) => {
    return (cliente.appuntamenti || []).length
  }

  if (clientiFiltrati.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">
          {searchQuery ? 'Nessun cliente trovato per questa ricerca' : 'Nessun cliente presente'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-xl border overflow-hidden">
      {/* HEADER GRADIENT */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-5 md:p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black">Lista Clienti</h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              {searchQuery ? `${clientiFiltrati.length} risultati trovati` : `${clientiFiltrati.length} clienti totali`}
            </p>
          </div>
        </div>
      </div>

      {/* TABELLA PROFESSIONALE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="p-2 sm:p-3 md:p-4 text-left font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider">Cliente</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider">Telefono</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider">Storia</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-black text-gray-800 text-xs sm:text-sm md:text-base uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientiFiltrati.map((cliente) => (
              editingId === cliente.id ? (
                <tr key={cliente.id}>
                  <td colSpan={4} className="p-6 bg-gray-50">
                    <ClienteEditForm
                      cliente={cliente}
                      onCancel={() => setEditingId(null)}
                      onSuccess={onClienteUpdated}
                    />
                  </td>
                </tr>
              ) : (
                <>
                  <tr key={cliente.id} className="group hover:bg-blue-50/50 transition-all cursor-pointer border-b hover:border-blue-200">
                    <td className="p-2 sm:p-3 md:p-4 font-semibold text-xl text-gray-900 group-hover:text-blue-800">
                      {cliente.cognome} {cliente.nome}
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 text-center">
                      {cliente.cellulare ? (
                        <a
                          href={`tel:${cliente.cellulare}`}
                          className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xl">{cliente.cellulare}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-base">-</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 md:p-4">
                      <button
                        onClick={() => setExpandedId(expandedId === cliente.id ? null : cliente.id)}
                        className="mx-auto flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        <span className="text-xl font-medium text-gray-700">{getAppuntamentiCount(cliente)}</span>
                      </button>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4">
                      <div className="flex gap-1 sm:gap-2 justify-center">
                        <button
                          onClick={() => router.push(`/clienti/${cliente.id}`)}
                          className="p-1.5 sm:p-2 hover:bg-green-100 rounded-xl group-hover:scale-105 transition-all"
                          title="Foto"
                        >
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => setEditingId(cliente.id)}
                          className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-xl group-hover:scale-105 transition-all"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          disabled={deletingId === cliente.id}
                          className="p-1.5 sm:p-2 hover:bg-red-100 rounded-xl group-hover:scale-105 transition-all disabled:opacity-50"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Storia - below row */}
                  {expandedId === cliente.id && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 bg-blue-50/30">
                        <div className="max-w-4xl mx-auto">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Storico Appuntamenti
                          </h4>
                          {cliente.appuntamenti && cliente.appuntamenti.length > 0 ? (
                            <div className="space-y-2">
                              {cliente.appuntamenti.slice(0, 5).map((app) => (
                                <div key={app.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-sm text-gray-600 font-medium">
                                    {new Date(app.dataOra).toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: '2-digit'
                                    })}
                                  </span>
                                  <span className="text-sm text-gray-900 font-semibold">{app.servizio}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    app.stato === 'completato' ? 'bg-green-100 text-green-700' :
                                    app.stato === 'confermato' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {app.stato}
                                  </span>
                                </div>
                              ))}
                              {cliente.appuntamenti.length > 5 && (
                                <p className="text-sm text-gray-500 italic text-center pt-2">
                                  ...e altri {cliente.appuntamenti.length - 5} appuntamenti
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic text-center py-4">Nessun appuntamento registrato</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            ))}
          </tbody>

          {/* FOOTER TOTALI */}
          <tfoot className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <tr>
              <td colSpan={2} className="p-3 sm:p-4 md:p-5 font-black text-base sm:text-lg md:text-xl">TOTALE CLIENTI</td>
              <td colSpan={2} className="p-3 sm:p-4 md:p-5 text-right">
                <span className="text-lg sm:text-xl md:text-2xl font-black">{clientiFiltrati.length}</span>
                <span className="text-xs sm:text-sm md:text-base font-medium ml-2">
                  {clientiFiltrati.length === 1 ? 'cliente' : 'clienti'}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
