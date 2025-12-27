import { getClienti } from '@/app/actions/clienti'
import ClientiList from './components/ClientiList'
import ClienteForm from './components/ClienteForm'
import ClientiSearch from './components/ClientiSearch'

export default async function ClientiPage() {
  const result = await getClienti()
  const clienti = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Clienti</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo cliente */}
        <ClienteForm />

        {/* Barra di ricerca */}
        <ClientiSearch />

        {/* Lista clienti */}
        <ClientiList clienti={clienti || []} />
      </div>
    </div>
  )
}
