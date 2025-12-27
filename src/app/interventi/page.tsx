import { getInterventi, getClientiForSelect, getProdottiForSelect } from '@/app/actions/interventi'
import InterventiList from './components/InterventiList'
import InterventoForm from './components/InterventoForm'

export default async function InterventiPage() {
  const [interventiResult, clientiResult, prodottiResult] = await Promise.all([
    getInterventi(),
    getClientiForSelect(),
    getProdottiForSelect()
  ])

  const interventi = interventiResult.success ? interventiResult.data : []
  const clienti = clientiResult.success ? clientiResult.data : []
  const prodotti = prodottiResult.success ? prodottiResult.data : []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Interventi</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo intervento */}
        <InterventoForm clienti={clienti || []} prodotti={prodotti || []} />

        {/* Lista interventi */}
        <InterventiList interventi={interventi || []} />
      </div>
    </div>
  )
}
