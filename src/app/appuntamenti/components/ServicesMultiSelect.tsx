'use client'

import { useState, useEffect, useRef } from 'react'
import { addServizioToAppuntamento, removeServizioFromAppuntamento } from '@/app/actions/appuntamenti'
import { getServiziAttivi } from '@/app/actions/servizi'

type Servizio = {
  id: string
  nome: string
  prezzo: number
  durata: number
}

type AppuntamentoServizio = {
  servizio: {
    id: string
    nome: string
    prezzo: number
    durata: number
  }
  ordine: number
}

export default function ServicesMultiSelect({
  appuntamentoId,
  currentServices,
  onSuccess
}: {
  appuntamentoId: number
  currentServices: AppuntamentoServizio[]
  onSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableServices, setAvailableServices] = useState<Servizio[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const loadServices = async () => {
    const result = await getServiziAttivi()
    if (result.success) {
      setAvailableServices(result.data)
    }
  }

  const handleToggleService = async (servizioId: string) => {
    const isCurrentlySelected = currentServices.some(s => s.servizio.id === servizioId)

    if (isCurrentlySelected) {
      // Remove service
      if (currentServices.length <= 1) {
        alert('Non puoi rimuovere l\'ultimo servizio')
        return
      }
      setLoading(true)
      const result = await removeServizioFromAppuntamento(appuntamentoId, servizioId)
      setLoading(false)

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error)
      }
    } else {
      // Add service
      setLoading(true)
      const result = await addServizioToAppuntamento(appuntamentoId, servizioId)
      setLoading(false)

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error)
      }
    }
  }

  const currentServiceIds = currentServices.map(s => s.servizio.id)
  const totalDuration = currentServices.reduce((sum, s) => sum + s.servizio.durata, 0)

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
        title="Gestisci Servizi"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">Servizi ({currentServices.length})</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b bg-gray-50">
            <div className="font-semibold text-sm text-gray-900">Gestione Servizi</div>
            <div className="text-xs text-gray-600 mt-1">
              Totale: {totalDuration} min ({currentServices.length} servizi)
            </div>
          </div>

          <div className="p-2">
            {availableServices.map((servizio) => {
              const isSelected = currentServiceIds.includes(servizio.id)
              const isLastService = isSelected && currentServices.length === 1

              return (
                <label
                  key={servizio.id}
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${
                    isLastService ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={loading || isLastService}
                      onChange={() => handleToggleService(servizio.id)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{servizio.nome}</div>
                      <div className="text-xs text-gray-500">
                        €{servizio.prezzo.toFixed(2)} • {servizio.durata} min
                      </div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="p-2 border-t bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-1.5 bg-gray-200 text-gray-800 rounded text-xs font-medium hover:bg-gray-300"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
