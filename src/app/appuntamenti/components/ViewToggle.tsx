'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ViewToggle({ currentView }: { currentView: string }) {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  return (
    <div className="flex bg-gray-100 rounded-lg p-1.5 gap-1">
      <Link
        href={`/appuntamenti?view=day&date=${date}`}
        className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold transition-colors ${
          currentView === 'day'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
      >
        Giorno
      </Link>
      <Link
        href={`/appuntamenti?view=week&date=${date}`}
        className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold transition-colors ${
          currentView === 'week'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
      >
        Settimana
      </Link>
    </div>
  )
}
