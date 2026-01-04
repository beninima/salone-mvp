'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

type WeekData = {
  startOfWeek: Date
  endOfWeek: Date
} | null

export default function DateSelector({
  selectedDate,
  view,
  weekData
}: {
  selectedDate: string
  view: string
  weekData?: WeekData
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const getDateUrl = (amount: number) => {
    // Parse date in local timezone to avoid UTC issues
    const [year, month, day] = selectedDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    if (view === 'week') {
      // Cambia settimana (7 giorni)
      date.setDate(date.getDate() + (amount * 7))
    } else {
      // Cambia giorno
      date.setDate(date.getDate() + amount)
    }

    // Format date as YYYY-MM-DD in local timezone
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    const newDay = String(date.getDate()).padStart(2, '0')
    const newDate = `${newYear}-${newMonth}-${newDay}`

    return `/appuntamenti?view=${view}&date=${newDate}`
  }

  const getTodayUrl = () => {
    const today = new Date().toISOString().split('T')[0]
    return `/appuntamenti?view=${view}&date=${today}`
  }

  const formatDate = (dateStr: string) => {
    // Parse date in local timezone
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selected = new Date(year, month - 1, day)
    selected.setHours(0, 0, 0, 0)

    if (selected.getTime() === today.getTime()) {
      return 'Oggi'
    }

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (selected.getTime() === tomorrow.getTime()) {
      return 'Domani'
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (selected.getTime() === yesterday.getTime()) {
      return 'Ieri'
    }

    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatWeek = () => {
    if (!weekData) return ''

    const start = new Date(weekData.startOfWeek)
    const end = new Date(weekData.endOfWeek)

    const startStr = start.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    const endStr = end.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

    return `${startStr} - ${endStr}`
  }

  const handleNavigate = (amount: number) => {
    const url = getDateUrl(amount)
    // Force full page reload to ensure navigation works
    window.location.href = url
  }

  const handleToday = () => {
    const url = getTodayUrl()
    // Force full page reload to ensure navigation works
    window.location.href = url
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        onClick={() => handleNavigate(-1)}
        className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 shadow-sm"
        style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)' }}
      >
        ←
      </button>

      <div className="flex-1 text-center">
        {view === 'week' ? (
          <>
            <div className="text-2xl font-semibold">Settimana</div>
            <div className="text-base text-gray-600">{formatWeek()}</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold capitalize">{formatDate(selectedDate)}</div>
            <div className="text-base text-gray-600">
              {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number)
                const date = new Date(year, month - 1, day)
                return date.toLocaleDateString('it-IT')
              })()}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => handleNavigate(1)}
        className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 shadow-sm"
        style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)' }}
      >
        →
      </button>

      <button
        onClick={handleToday}
        className="px-4 py-3 sm:px-6 sm:py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md"
        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
      >
        Oggi
      </button>
    </div>
  )
}
