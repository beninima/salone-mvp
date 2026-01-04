'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { getClienti } from '@/app/actions/clienti'
import ClientiList from './components/ClientiList'
import ClienteForm from './components/ClienteForm'
import ClientiSearch from './components/ClientiSearch'

type Cliente = {
  id: number
  nome: string
  cognome: string
  cellulare: string | null
  note: string | null
  appuntamenti?: any[]
  interventi?: any[]
}

export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const loadClienti = async () => {
    setLoading(true)
    const result = await getClienti()
    setClienti(result.success ? result.data : [])
    setLoading(false)
  }

  useEffect(() => {
    loadClienti()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Clienti</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo cliente */}
        <ClienteForm />

        {/* Barra di ricerca */}
        <Suspense fallback={<div className="w-full px-6 py-3 border border-gray-300 rounded-lg bg-gray-50">Caricamento...</div>}>
          <ClientiSearch />
        </Suspense>

        {/* Lista clienti */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Caricamento...</p>
          </div>
        ) : (
          <ClientiList clienti={clienti || []} onClienteUpdated={loadClienti} />
        )}
      </div>
    </div>
  )
}
