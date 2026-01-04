import { getAppuntamentiByDate, getAppuntamentiByWeek, getClientiForSelect } from '@/app/actions/appuntamenti'
import { getOperatoriAttivi } from '@/app/actions/operatori'
import { getServiziAttivi } from '@/app/actions/servizi'
import AppuntamentiAgenda from './components/AppuntamentiAgenda'
import AppuntamentiWeekView from './components/AppuntamentiWeekView'
import AppuntamentoForm from './components/AppuntamentoForm'
import DateSelector from './components/DateSelector'
import ViewToggle from './components/ViewToggle'
import DashboardStats from './components/DashboardStats'

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

  // Per la vista settimanale, calcola le date di inizio e fine settimana
  let weekData = null
  if (view === 'week') {
    const [year, month, day] = selectedDate.split('-').map(Number)
    const selectedDateObj = new Date(year, month - 1, day)

    // Trova il lunedì della settimana
    const dayOfWeek = selectedDateObj.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const startOfWeek = new Date(selectedDateObj)
    startOfWeek.setDate(selectedDateObj.getDate() + diff)
    startOfWeek.setHours(0, 0, 0, 0)

    // Trova la domenica della settimana
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    weekData = { startOfWeek, endOfWeek }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - più compatto */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Appuntamenti</h1>
            <ViewToggle currentView={view} />
          </div>
          <DateSelector selectedDate={selectedDate} view={view} weekData={weekData} />
        </div>
      </div>

      {/* Content - spazio ridotto */}
      <div className="px-4 py-3 space-y-3">
        {/* Form per nuovo appuntamento */}
        <AppuntamentoForm
          clienti={clienti || []}
          operatori={operatori || []}
          servizi={servizi || []}
          selectedDate={selectedDate}
        />

        {/* Dashboard Stats */}
        <DashboardStats appuntamenti={appuntamenti || []} />

        {/* Calendario Settimanale */}
        {view === 'week' && (
          <AppuntamentiWeekView
            appuntamenti={appuntamenti || []}
            operatori={operatori || []}
            weekData={weekData}
            clienti={clienti || []}
            servizi={servizi || []}
          />
        )}
      </div>
    </div>
  )
}
