'use client'

import { useState } from 'react'
import { deleteFotoLavoro } from '@/app/actions/foto-lavori'
import FotoGrid from '@/app/components/FotoGrid'

type Foto = {
  id: string
  url: string
  tipo: string
  ordine: number
}

type LavoroCardProps = {
  lavoro: {
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
    foto: Foto[]
  }
  onDelete: () => void
}

export default function LavoroCard({ lavoro, onDelete }: LavoroCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fotoPrima = lavoro.foto.filter(f => f.tipo === 'prima')
  const fotoDopo = lavoro.foto.filter(f => f.tipo === 'dopo')

  const handleDelete = async () => {
    if (!confirm('Eliminare questo lavoro e tutte le foto associate?')) {
      return
    }

    setDeleting(true)
    const result = await deleteFotoLavoro(lavoro.id)

    if (result.success) {
      onDelete()
    } else {
      alert(result.error || 'Errore durante l\'eliminazione')
      setDeleting(false)
    }
  }

  const formatData = (data: Date) => {
    const d = new Date(data)
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">
                {formatData(lavoro.data)}
              </h3>
              {lavoro.servizio && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                  {lavoro.servizio.nome}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700">
              👤 {lavoro.operatore.nome} {lavoro.operatore.cognome}
            </p>
            {lavoro.note && (
              <p className="text-base text-gray-600 mt-1 italic">"{lavoro.note}"</p>
            )}
            <div className="flex gap-4 mt-2 text-xs text-gray-600">
              <span>📸 PRIMA: {fotoPrima.length}</span>
              <span>📸 DOPO: {fotoDopo.length}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={deleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? '...' : '🗑️'}
            </button>

            <button
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-6 space-y-4">
          {/* Foto PRIMA */}
          {fotoPrima.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">📸 PRIMA</h4>
              <FotoGrid foto={fotoPrima} tipo="prima" readOnly />
            </div>
          )}

          {/* Foto DOPO */}
          {fotoDopo.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">📸 DOPO</h4>
              <FotoGrid foto={fotoDopo} tipo="dopo" readOnly />
            </div>
          )}

          {fotoPrima.length === 0 && fotoDopo.length === 0 && (
            <p className="text-base text-gray-500 text-center py-4">
              Nessuna foto disponibile
            </p>
          )}
        </div>
      )}
    </div>
  )
}
