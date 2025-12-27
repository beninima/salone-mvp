'use client'

import Link from 'next/link'
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
  const searchParams = useSearchParams()

  const getDateUrl = (amount: number) => {
    const date = new Date(selectedDate)
    if (view === 'week') {
      // Cambia settimana (7 giorni)
      date.setDate(date.getDate() + (amount * 7))
    } else {
      // Cambia giorno
      date.setDate(date.getDate() + amount)
    }
    const newDate = date.toISOString().split('T')[0]
    return `/appuntamenti?view=${view}&date=${newDate}`
  }

  const getTodayUrl = () => {
    const today = new Date().toISOString().split('T')[0]
    return `/appuntamenti?view=${view}&date=${today}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selected = new Date(dateStr)
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

  return (
    <div className="flex items-center gap-2">
      <Link
        href={getDateUrl(-1)}
        className="px-3 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300"
      >
        ←
      </Link>

      <div className="flex-1 text-center">
        {view === 'week' ? (
          <>
            <div className="text-lg font-semibold">Settimana</div>
            <div className="text-sm text-gray-600">{formatWeek()}</div>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold capitalize">{formatDate(selectedDate)}</div>
            <div className="text-sm text-gray-600">
              {new Date(selectedDate).toLocaleDateString('it-IT')}
            </div>
          </>
        )}
      </div>

      <Link
        href={getDateUrl(1)}
        className="px-3 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300"
      >
        →
      </Link>

      <Link
        href={getTodayUrl()}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Oggi
      </Link>
    </div>
  )
}
