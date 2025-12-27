import { getAppuntamentiByDate, getAppuntamentiByWeek, getClientiForSelect } from '@/app/actions/appuntamenti'
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

  const [appuntamentiResult, clientiResult] = await Promise.all([
    view === 'week'
      ? getAppuntamentiByWeek(selectedDate)
      : getAppuntamentiByDate(selectedDate),
    getClientiForSelect()
  ])

  const appuntamenti = appuntamentiResult.success ? appuntamentiResult.data : []
  const clienti = clientiResult.success ? clientiResult.data : []

  // Per la vista settimanale, ottieni le date di inizio e fine settimana
  const weekData = view === 'week' && appuntamentiResult.success
    ? {
        startOfWeek: appuntamentiResult.startOfWeek,
        endOfWeek: appuntamentiResult.endOfWeek
      }
    : null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Appuntamenti</h1>
            <ViewToggle currentView={view} />
          </div>
          <DateSelector selectedDate={selectedDate} view={view} weekData={weekData} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Form per nuovo appuntamento */}
        <AppuntamentoForm clienti={clienti || []} selectedDate={selectedDate} />

        {/* Agenda */}
        {view === 'week' ? (
          <AppuntamentiWeekView
            appuntamenti={appuntamenti || []}
            weekData={weekData}
          />
        ) : (
          <AppuntamentiAgenda appuntamenti={appuntamenti || []} />
        )}
      </div>
    </div>
  )
}
