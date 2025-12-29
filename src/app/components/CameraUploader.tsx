'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'

type CameraUploaderProps = {
  onCapture: (file: File) => void
  onClose: () => void
  tipo: 'prima' | 'dopo'
}

export default function CameraUploader({ onCapture, onClose, tipo }: CameraUploaderProps) {
  const [mode, setMode] = useState<'menu' | 'camera'>('menu')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      // Convert base64 to File
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `foto-${tipo}-${Date.now()}.jpg`, { type: 'image/jpeg' })
          onCapture(file)
          onClose()
        })
    }
  }, [webcamRef, onCapture, onClose, tipo])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onCapture(file)
      onClose()
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  if (mode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode,
              width: 1280,
              height: 720
            }}
            className="w-full h-full object-cover"
          />

          {/* Overlay guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white border-dashed w-64 h-64 rounded-lg opacity-50"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black p-6 flex justify-around items-center gap-4">
          <button
            onClick={() => setMode('menu')}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            ← Indietro
          </button>

          <button
            onClick={capture}
            className="w-20 h-20 bg-white rounded-full border-4 border-blue-500 hover:bg-gray-100 active:scale-95 transition-all shadow-lg flex items-center justify-center"
            title="Scatta foto"
          >
            <span className="text-2xl">📷</span>
          </button>

          <button
            onClick={switchCamera}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            🔄 Cam
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Foto {tipo === 'prima' ? 'PRIMA' : 'DOPO'}
          </h2>
          <p className="text-sm text-gray-600">Scegli come acquisire la foto</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setMode('camera')}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            📷 Usa Camera
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            📁 Scegli da Galleria
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ✕ Annulla
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
