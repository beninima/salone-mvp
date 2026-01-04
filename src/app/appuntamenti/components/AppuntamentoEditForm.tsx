'use client'

import { useState } from 'react'
import { updateAppuntamento } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'

type Cliente = {
  id: number
  nome: string
  cognome: string
}

type Operatore = {
  id: string
  nome: string
  cognome: string
  colore: string | null
}

type Servizio = {
  id: string
  nome: string
  prezzo: number
  durata: number
}

type Appuntamento = {
  id: number
  dataOra: Date
  durata: number
  stato: string
  cliente: {
    id: number
    nome: string
    cognome: string
  }
  operatore: {
    id: string
    nome: string
    cognome: string
    colore: string | null
  }
  servizi: {
    servizio: {
      id: string
      nome: string
      prezzo: number
      durata: number
    }
    ordine: number
  }[]
}

export default function AppuntamentoEditForm({
  appuntamento,
  clienti,
  operatori,
  servizi,
  onCancel,
  onSuccess
}: {
  appuntamento: Appuntamento
  clienti: Cliente[]
  operatori: Operatore[]
  servizi: Servizio[]
  onCancel: () => void
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<{servizioId: string, durata: number}[]>(
    appuntamento.servizi.length > 0
      ? appuntamento.servizi.map(s => ({servizioId: s.servizio.id, durata: s.servizio.durata}))
      : [{servizioId: '', durata: 0}]
  )
  const router = useRouter()

  // Sort clienti alphabetically by cognome
  const sortedClienti = [...clienti].sort((a, b) =>
    a.cognome.localeCompare(b.cognome)
  )

  // Calculate total duration based on custom durations
  const totalDuration = selectedServices.reduce((sum, service) => sum + (service.durata || 0), 0)

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      // Redirect to clients page with return flag
      router.push('/clienti?from=appuntamenti')
    }
  }

  const handleServiceChange = (index: number, servizioId: string) => {
    const newServices = [...selectedServices]
    const servizio = servizi.find(s => s.id === servizioId)
    newServices[index] = {
      servizioId,
      durata: servizio?.durata || 0
    }
    setSelectedServices(newServices)
  }

  const handleDurationChange = (index: number, durata: number) => {
    const newServices = [...selectedServices]
    newServices[index] = {
      ...newServices[index],
      durata
    }
    setSelectedServices(newServices)
  }

  const handleAddService = () => {
    setSelectedServices([...selectedServices, {servizioId: '', durata: 0}])
  }

  const handleRemoveService = (index: number) => {
    if (selectedServices.length > 1) {
      setSelectedServices(selectedServices.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validServices = selectedServices.filter(s => s.servizioId !== '')

    if (validServices.length === 0) {
      alert('Seleziona almeno un servizio')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Add all selected services to form data
    validServices.forEach(service => {
      formData.append('servizi', service.servizioId)
    })
    // Add calculated total duration
    formData.set('durata', totalDuration.toString())

    const result = await updateAppuntamento(appuntamento.id, formData)

    setLoading(false)

    if (result.success) {
      if (onSuccess) {
        onSuccess()
      }
      onCancel()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format time for input (HH:MM)
  const formatTimeForInput = (date: Date) => {
    const d = new Date(date)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div className="bg-gray-50 rounded-lg shadow p-6 border-2 border-blue-200">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Modifica Appuntamento</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            name="clienteId"
            required
            defaultValue={appuntamento.cliente.id}
            onChange={handleClienteChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona cliente</option>
            {sortedClienti.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.cognome} {cliente.nome}
              </option>
            ))}
            <option value="new" className="font-semibold text-green-600">+ Nuovo Cliente</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Operatore *
          </label>
          <select
            name="operatoreId"
            required
            defaultValue={appuntamento.operatore.id}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona operatore</option>
            {operatori.map((operatore) => (
              <option key={operatore.id} value={operatore.id}>
                {operatore.cognome} {operatore.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Data *
          </label>
          <input
            type="date"
            name="data"
            defaultValue={formatDateForInput(appuntamento.dataOra)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Ora *
          </label>
          <input
            type="time"
            name="ora"
            defaultValue={formatTimeForInput(appuntamento.dataOra)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Servizi *
          </label>
          <div className="space-y-3">
            {selectedServices.map((service, index) => {
              const selectedServizio = servizi.find(s => s.id === service.servizioId)

              return (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <select
                        value={service.servizioId}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleziona servizio</option>
                        {servizi.map((servizio) => (
                          <option key={servizio.id} value={servizio.id}>
                            {servizio.nome} - €{servizio.prezzo.toFixed(2)} ({servizio.durata} min)
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                  {selectedServizio && (
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">Durata (minuti):</label>
                      <input
                        type="number"
                        min="1"
                        value={service.durata}
                        onChange={(e) => handleDurationChange(index, parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )
            })}

            <button
              type="button"
              onClick={handleAddService}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              + Altro Servizio
            </button>

            {totalDuration > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">
                  Durata totale: {totalDuration} minuti
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </div>
  )
}
