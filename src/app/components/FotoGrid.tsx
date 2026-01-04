'use client'

import { useState } from 'react'
import Image from 'next/image'

type Foto = {
  id: string
  url: string
  ordine: number
}

type FotoGridProps = {
  foto: Foto[]
  tipo: 'prima' | 'dopo'
  onRemove?: (fotoId: string) => void
  readOnly?: boolean
}

export default function FotoGrid({ foto, tipo, onRemove, readOnly = false }: FotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sortedFoto = [...foto].sort((a, b) => a.ordine - b.ordine)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const nextPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex < sortedFoto.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  if (foto.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-base text-gray-500">Nessuna foto {tipo}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedFoto.map((f, index) => (
          <div key={f.id} className="relative group aspect-square">
            <Image
              src={f.url}
              alt={`Foto ${tipo} ${f.ordine}`}
              fill
              className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(index)}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />

            {/* Overlay on hover */}
            <div
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Remove button */}
            {!readOnly && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(f.id)
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Order badge */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {f.ordine}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-6"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
              className="absolute left-4 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {lightboxIndex < sortedFoto.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextPhoto()
              }}
              className="absolute right-4 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            <Image
              src={sortedFoto[lightboxIndex].url}
              alt={`Foto ${tipo} ${sortedFoto[lightboxIndex].ordine}`}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
              sizes="100vw"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-6 py-3 rounded-full">
            {lightboxIndex + 1} / {sortedFoto.length}
          </div>
        </div>
      )}
    </>
  )
}
