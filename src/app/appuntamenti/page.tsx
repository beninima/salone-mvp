import { getAppuntamentiByDate, getAppuntamentiByWeek, getClientiForSelect } from '@/app/actions/appuntamenti'
import { getOperatoriAttivi } from '@/app/actions/operatori'
import { getServiziAttivi } from '@/app/actions/servizi'
import AppuntamentiAgenda from './components/AppuntamentiAgenda'
import AppuntamentiWeekView from './components/AppuntamentiWeekView'
import AppuntamentoForm from './components/AppuntamentoForm'
import DateSelector from './components/DateSelector'
import ViewToggle from './components/ViewToggle'

export default async function AppuntamentiPage({
  searchParams
}: {
  searchParams: { date?: string; view?: string }
}) {
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = searchParams.date || today
  const view = searchParams.view || 'day' // 'day' o 'week'

  const [appuntamentiResult, clientiResult, operatoriResult, serviziResult] = await Promise.all([
    view === 'week'
      ? getAppuntamentiByWeek(selectedDate)
      : getAppuntamentiByDate(selectedDate),
    getClientiForSelect(),
    getOperatoriAttivi(),
    getServiziAttivi()
  ])

  const appuntamenti = appuntamentiResult.success ? appuntamentiResult.data : []
  const clienti = clientiResult.success ? clientiResult.data : []
  const operatori = operatoriResult.success ? operatoriResult.data : []
  const servizi = serviziResult.success ? serviziResult.data : []

  // Per la vista settimanale, ottieni le date di inizio e fine settimana
  const weekData = null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-gray-900">Appuntamenti</h1>
            <ViewToggle currentView={view} />
          </div>
          <DateSelector selectedDate={selectedDate} view={view} weekData={weekData} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo appuntamento */}
        <AppuntamentoForm
          clienti={clienti || []}
          operatori={operatori || []}
          servizi={servizi || []}
          selectedDate={selectedDate}
        />

        {/* Agenda */}
        {view === 'week' ? (
          <AppuntamentiWeekView
            appuntamenti={appuntamenti || []}
            operatori={operatori || []}
            weekData={weekData}
            clienti={clienti || []}
            servizi={servizi || []}
          />
        ) : (
          <AppuntamentiAgenda
            appuntamenti={appuntamenti || []}
            clienti={clienti || []}
            operatori={operatori || []}
            servizi={servizi || []}
          />
        )}
      </div>
    </div>
  )
}
