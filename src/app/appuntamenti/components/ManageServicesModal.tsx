'use client'

import { useState, useEffect } from 'react'
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

export default function ManageServicesModal({
  appuntamentoId,
  currentServices,
  onClose,
  onSuccess
}: {
  appuntamentoId: number
  currentServices: AppuntamentoServizio[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [availableServices, setAvailableServices] = useState<Servizio[]>([])
  const [loading, setLoading] = useState(false)
  const [actioningServiceId, setActioningServiceId] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const result = await getServiziAttivi()
    if (result.success) {
      setAvailableServices(result.data)
    }
  }

  const handleAddService = async (servizioId: string) => {
    setActioningServiceId(servizioId)
    setLoading(true)

    const result = await addServizioToAppuntamento(appuntamentoId, servizioId)

    setLoading(false)
    setActioningServiceId(null)

    if (result.success) {
      onSuccess()
    } else {
      alert(result.error)
    }
  }

  const handleRemoveService = async (servizioId: string) => {
    if (currentServices.length <= 1) {
      alert('Non puoi rimuovere l\'ultimo servizio')
      return
    }

    setActioningServiceId(servizioId)
    setLoading(true)

    const result = await removeServizioFromAppuntamento(appuntamentoId, servizioId)

    setLoading(false)
    setActioningServiceId(null)

    if (result.success) {
      onSuccess()
    } else {
      alert(result.error)
    }
  }

  const currentServiceIds = currentServices.map(s => s.servizio.id)
  const servicesNotAdded = availableServices.filter(s => !currentServiceIds.includes(s.id))

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Gestione Servizi Appuntamento</h3>

        {/* Current Services */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            Servizi Attuali ({currentServices.length})
          </h4>
          <div className="space-y-2">
            {currentServices.map((as) => (
              <div
                key={as.servizio.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{as.servizio.nome}</div>
                  <div className="text-sm text-gray-600">
                    €{as.servizio.prezzo.toFixed(2)} - {as.servizio.durata} min
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveService(as.servizio.id)}
                  disabled={loading || currentServices.length <= 1}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    currentServices.length <= 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
                  title={currentServices.length <= 1 ? 'Almeno un servizio è richiesto' : 'Rimuovi servizio'}
                >
                  {actioningServiceId === as.servizio.id ? '...' : 'Rimuovi'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Available Services to Add */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            Aggiungi Servizi ({servicesNotAdded.length} disponibili)
          </h4>
          {servicesNotAdded.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Tutti i servizi sono già stati aggiunti</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {servicesNotAdded.map((servizio) => (
                <div
                  key={servizio.id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{servizio.nome}</div>
                    <div className="text-sm text-gray-600">
                      €{servizio.prezzo.toFixed(2)} - {servizio.durata} min
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddService(servizio.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actioningServiceId === servizio.id ? '...' : 'Aggiungi'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}
