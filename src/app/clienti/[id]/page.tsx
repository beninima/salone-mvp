'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getClienteById } from '@/app/actions/clienti'
import { getFotoLavoriByCliente } from '@/app/actions/foto-lavori'
import { getOperatori } from '@/app/actions/operatori'
import { getServiziAttivi } from '@/app/actions/servizi'
import NuovoLavoroModal from '../components/NuovoLavoroModal'
import LavoroCard from '../components/LavoroCard'

type Cliente = {
  id: number
  nome: string
  cognome: string
  cellulare: string | null
  note: string | null
}

type FotoLavoro = {
  id: string
  data: Date
  note: string | null
  operatore: {
    nome: string
    cognome: string
  }
  servizio: {
    nome: string
  } | null
  foto: {
    id: string
    url: string
    tipo: string
    ordine: number
  }[]
}

type Operatore = {
  id: string
  nome: string
  cognome: string
}

type Servizio = {
  id: string
  nome: string
}

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const clienteId = parseInt(params.id)

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [fotoLavori, setFotoLavori] = useState<FotoLavoro[]>([])
  const [operatori, setOperatori] = useState<Operatore[]>([])
  const [servizi, setServizi] = useState<Servizio[]>([])
  const [loading, setLoading] = useState(true)
  const [showNuovoLavoro, setShowNuovoLavoro] = useState(false)

  const loadData = async () => {
    setLoading(true)

    const [clienteRes, lavoriRes, operatoriRes, serviziRes] = await Promise.all([
      getClienteById(clienteId),
      getFotoLavoriByCliente(clienteId),
      getOperatori(),
      getServiziAttivi()
    ])

    if (clienteRes.success && clienteRes.data) {
      setCliente(clienteRes.data)
    } else {
      router.push('/clienti')
      return
    }

    if (lavoriRes.success) {
      setFotoLavori(lavoriRes.data)
    }

    if (operatoriRes.success) {
      setOperatori(operatoriRes.data.filter(o => o.attivo))
    }

    if (serviziRes.success) {
      setServizi(serviziRes.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [clienteId])

  if (loading || !cliente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {cliente.nome} {cliente.cognome}
          </h1>
          {cliente.cellulare && (
            <a
              href={`tel:${cliente.cellulare}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {cliente.cellulare}
            </a>
          )}
          {cliente.note && (
            <p className="text-sm text-gray-600 mt-1">{cliente.note}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Nuova Foto Button */}
        <button
          onClick={() => setShowNuovoLavoro(true)}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          📸 Nuova Foto
        </button>

        {/* Storico Lavori */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">
            Storico Lavori ({fotoLavori.length})
          </h2>

          {fotoLavori.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Nessuna foto registrata</p>
              <p className="text-sm text-gray-500 mt-1">
                Clicca su "Nuova Foto" per iniziare
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fotoLavori.map((lavoro) => (
                <LavoroCard
                  key={lavoro.id}
                  lavoro={lavoro}
                  onDelete={() => loadData()}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nuovo Lavoro Modal */}
      {showNuovoLavoro && (
        <NuovoLavoroModal
          clienteId={clienteId}
          clienteNome={`${cliente.nome} ${cliente.cognome}`}
          operatori={operatori}
          servizi={servizi}
          onClose={() => setShowNuovoLavoro(false)}
          onSuccess={() => {
            setShowNuovoLavoro(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
