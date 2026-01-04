import { getProdotti } from '@/app/actions/prodotti'
import ProdottiList from './components/ProdottiList'
import ProdottoForm from './components/ProdottoForm'

export default async function ProdottiPage() {
  const result = await getProdotti()
  const prodotti = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Prodotti</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo prodotto */}
        <ProdottoForm />

        {/* Lista prodotti */}
        <ProdottiList prodotti={prodotti || []} />
      </div>
    </div>
  )
}
