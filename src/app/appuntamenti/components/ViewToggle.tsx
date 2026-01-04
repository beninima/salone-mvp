'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ViewToggle({ currentView }: { currentView: string }) {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Link
        href={`/appuntamenti?view=day&date=${date}`}
        className={`px-3 py-1 rounded text-base font-medium transition-colors ${
          currentView === 'day'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Giorno
      </Link>
      <Link
        href={`/appuntamenti?view=week&date=${date}`}
        className={`px-3 py-1 rounded text-base font-medium transition-colors ${
          currentView === 'week'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Settimana
      </Link>
    </div>
  )
}
