'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ClientiSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) {
      router.push(`/clienti?q=${encodeURIComponent(value)}`)
    } else {
      router.push('/clienti')
    }
  }

  const clearSearch = () => {
    setSearch('')
    router.push('/clienti')
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Cerca cliente per nome, cognome o telefono..."
        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {search && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
