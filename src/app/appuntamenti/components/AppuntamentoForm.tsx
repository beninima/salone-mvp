'use client'

import { useState } from 'react'
import { createAppuntamento } from '@/app/actions/appuntamenti'
import { useRouter } from 'next/navigation'
import NuovoClienteModal from './NuovoClienteModal'

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

export default function AppuntamentoForm({
  clienti,
  operatori,
  servizi,
  selectedDate
}: {
  clienti: Cliente[]
  operatori: Operatore[]
  servizi: Servizio[]
  selectedDate: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<{servizioId: string, durata: number}[]>([{servizioId: '', durata: 0}])
  const [showNuovoClienteModal, setShowNuovoClienteModal] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [newlyCreatedCliente, setNewlyCreatedCliente] = useState<Cliente | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const router = useRouter()

  // Sort clienti alphabetically by cognome, including newly created client
  const allClienti = newlyCreatedCliente
    ? [...clienti, newlyCreatedCliente]
    : clienti
  const sortedClienti = [...allClienti].sort((a, b) =>
    a.cognome.localeCompare(b.cognome)
  )

  // Calculate total duration based on custom durations
  const totalDuration = selectedServices.reduce((sum, service) => sum + (service.durata || 0), 0)

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      // Open modal to create new client
      setShowNuovoClienteModal(true)
      // Reset select to empty
      e.target.value = ''
    } else {
      setSelectedClienteId(e.target.value)
    }
  }

  const handleClienteCreated = (cliente: Cliente) => {
    // Add the newly created client to local state and select it
    setNewlyCreatedCliente(cliente)
    setSelectedClienteId(cliente.id.toString())
    setShowNuovoClienteModal(false)
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

    const result = await createAppuntamento(formData)

    setLoading(false)

    if (result.success) {
      setIsOpen(false)
      setSelectedServices([{servizioId: '', durata: 0}])
      e.currentTarget.reset()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
        style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}
      >
        + Nuovo Appuntamento
      </button>
    )
  }

  // Servizi rapidi comuni
  const servizioTaglio = servizi.find(s => s.nome.toLowerCase().includes('taglio'))
  const servizioColore = servizi.find(s => s.nome.toLowerCase().includes('colore') || s.nome.toLowerCase().includes('piega'))
  const servizioCompleto = servizi.find(s => s.nome.toLowerCase().includes('completo'))

  const selectServizioRapido = (servizioId: string | undefined) => {
    if (!servizioId) return
    const servizio = servizi.find(s => s.id === servizioId)
    if (servizio) {
      setSelectedServices([{
        servizioId: servizio.id,
        durata: servizio.durata
      }])
    }
  }

  // Format date display for header
  const formatHeaderDate = () => {
    const [year, month, day] = selectedDate.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const weekday = date.toLocaleDateString('it-IT', { weekday: 'short' })
    const dayMonth = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayMonth}`
  }

  // Calcola orario di fine
  const calculateEndTime = () => {
    if (!selectedTime || totalDuration === 0) return ''

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + totalDuration
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header informativo con data e ora */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-blue-100">
        <h1 className="text-xl font-bold text-blue-800">
          ➕ Nuovo · {formatHeaderDate()}{selectedTime && ` · ${selectedTime}`}
        </h1>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cliente *
          </label>
          <select
            name="clienteId"
            value={selectedClienteId}
            required
            onChange={handleClienteChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Operatore *
          </label>
          <select
            name="operatoreId"
            required
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          >
            <option value="">Seleziona operatore</option>
            {operatori.map((operatore) => (
              <option key={operatore.id} value={operatore.id}>
                {operatore.cognome} {operatore.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data *
            </label>
            <input
              type="date"
              name="data"
              defaultValue={selectedDate}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ora * {selectedTime && totalDuration > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  (Fine: {calculateEndTime()})
                </span>
              )}
            </label>
            <input
              type="time"
              name="ora"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servizi *
          </label>

          {/* Icone rapide servizi */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {servizioTaglio && (
              <button
                type="button"
                onClick={() => selectServizioRapido(servizioTaglio.id)}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center transition-colors border border-blue-200"
              >
                <span className="text-2xl mb-1">✂️</span>
                <span className="text-xs font-medium text-blue-800">Taglio</span>
              </button>
            )}
            {servizioColore && (
              <button
                type="button"
                onClick={() => selectServizioRapido(servizioColore.id)}
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl flex flex-col items-center transition-colors border border-purple-200"
              >
                <span className="text-2xl mb-1">🎨</span>
                <span className="text-xs font-medium text-purple-800">Colore</span>
              </button>
            )}
            {servizioCompleto && (
              <button
                type="button"
                onClick={() => selectServizioRapido(servizioCompleto.id)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex flex-col items-center transition-colors border border-emerald-200"
              >
                <span className="text-2xl mb-1">✨</span>
                <span className="text-xs font-medium text-emerald-800">Completo</span>
              </button>
            )}
          </div>

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

            {/* Preset durata rapidi */}
            <div className="flex gap-2 mt-2">
              <span className="text-xs font-medium text-gray-600 self-center">Durata rapida:</span>
              {[30, 60, 90].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    if (selectedServices[0]) {
                      setSelectedServices([{
                        ...selectedServices[0],
                        durata: mins
                      }])
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 border border-gray-300"
                >
                  {mins} min
                </button>
              ))}
            </div>

            {totalDuration > 0 && (
              <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-900">
                  ⏱️ Durata totale: {totalDuration} minuti
                  {selectedTime && ` (${selectedTime} - ${calculateEndTime()})`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pulsanti action professionali */}
        <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors"
          >
            ❌ Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Salvataggio...' : '💾 Salva Appuntamento'}
          </button>
        </div>
      </form>

      {/* Modale per creare nuovo cliente */}
      <NuovoClienteModal
        isOpen={showNuovoClienteModal}
        onClose={() => setShowNuovoClienteModal(false)}
        onClienteCreated={handleClienteCreated}
      />
    </div>
  )
}
