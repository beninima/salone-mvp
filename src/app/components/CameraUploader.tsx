'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'

type CameraUploaderProps = {
  onCapture: (file: File) => void
  onClose: () => void
  tipo: 'prima' | 'dopo'
}

export default function CameraUploader({ onCapture, onClose, tipo }: CameraUploaderProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()

    if (!imageSrc) {
      alert('Camera non pronta. Attendi qualche secondo e riprova.')
      return
    }

    // Convert base64 to File
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `foto-${tipo}-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
        onClose()
      })
      .catch(err => {
        console.error('Errore cattura foto:', err)
        alert('Errore durante la cattura. Riprova.')
      })
  }, [onCapture, onClose, tipo])

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

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* HEADER - 10% */}
      <div className="flex justify-between items-center p-6 bg-black/50 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="text-white text-2xl p-3 rounded-full hover:bg-white/20 transition-colors"
          title="Chiudi"
        >
          ✕
        </button>

        <div className="text-white text-lg font-bold">
          📸 Foto {tipo === 'prima' ? 'PRIMA' : 'DOPO'}
        </div>

        <button
          onClick={switchCamera}
          className="text-white text-2xl p-3 rounded-full hover:bg-white/20 transition-colors"
          title="Cambia camera"
        >
          🔄
        </button>
      </div>

      {/* VIDEO PREVIEW - 80% */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
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

        {/* Guide overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-white border-dashed w-64 h-64 rounded-lg opacity-30"></div>
        </div>
      </div>

      {/* BOTTONI BOTTOM - 10% */}
      <div className="p-6 space-y-4 bg-black/30 backdrop-blur-sm">
        {/* BOTTONE SCATTA CENTRALE GRANDE */}
        <div className="flex justify-center">
          <button
            onClick={capture}
            className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative"
            title="Scatta foto"
          >
            {/* Cerchio rosso interno */}
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">📷</span>
            </div>
          </button>
        </div>

        {/* GALLERIA */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 px-6 bg-white/90 rounded-xl text-lg font-bold hover:bg-white transition-all flex items-center justify-center gap-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          📁 Seleziona dalla galleria
        </button>

        {/* Hidden file input */}
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
