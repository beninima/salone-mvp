'use client'

import { useState } from 'react'
import { createFotoLavoro, addFoto } from '@/app/actions/foto-lavori'
import { uploadToBlob, compressImage } from '@/lib/upload'
import CameraUploader from '@/app/components/CameraUploader'
import Image from 'next/image'

type NuovoLavoroModalProps = {
  clienteId: number
  clienteNome: string
  operatori: { id: string; nome: string; cognome: string }[]
  servizi: { id: string; nome: string }[]
  onClose: () => void
  onSuccess: () => void
}

type FotoPreview = {
  file: File
  preview: string
}

export default function NuovoLavoroModal({
  clienteId,
  clienteNome,
  operatori,
  servizi,
  onClose,
  onSuccess
}: NuovoLavoroModalProps) {
  const [operatoreId, setOperatoreId] = useState(operatori[0]?.id || '')
  const [servizioId, setServizioId] = useState('')
  const [note, setNote] = useState('')
  const [fotoPrima, setFotoPrima] = useState<FotoPreview[]>([])
  const [fotoDopo, setFotoDopo] = useState<FotoPreview[]>([])
  const [showCamera, setShowCamera] = useState<'prima' | 'dopo' | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')

  const handleAddFoto = (file: File, tipo: 'prima' | 'dopo') => {
    const preview = URL.createObjectURL(file)
    const newFoto = { file, preview }

    if (tipo === 'prima') {
      if (fotoPrima.length >= 5) {
        alert('Massimo 5 foto PRIMA')
        return
      }
      setFotoPrima([...fotoPrima, newFoto])
    } else {
      if (fotoDopo.length >= 5) {
        alert('Massimo 5 foto DOPO')
        return
      }
      setFotoDopo([...fotoDopo, newFoto])
    }
  }

  const handleRemoveFoto = (index: number, tipo: 'prima' | 'dopo') => {
    if (tipo === 'prima') {
      const newFoto = [...fotoPrima]
      URL.revokeObjectURL(newFoto[index].preview)
      newFoto.splice(index, 1)
      setFotoPrima(newFoto)
    } else {
      const newFoto = [...fotoDopo]
      URL.revokeObjectURL(newFoto[index].preview)
      newFoto.splice(index, 1)
      setFotoDopo(newFoto)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!operatoreId) {
      alert('Seleziona un operatore')
      return
    }

    if (fotoPrima.length === 0 && fotoDopo.length === 0) {
      alert('Aggiungi almeno una foto')
      return
    }

    setUploading(true)
    setProgress('Creazione lavoro...')

    try {
      // 1. Create FotoLavoro
      const formData = new FormData()
      formData.append('clienteId', clienteId.toString())
      formData.append('operatoreId', operatoreId)
      if (servizioId) formData.append('servizioId', servizioId)
      if (note) formData.append('note', note)

      const createResult = await createFotoLavoro(formData)

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error || 'Errore creazione lavoro')
      }

      const fotoLavoroId = createResult.data.id

      // 2. Upload and add PRIMA photos
      for (let i = 0; i < fotoPrima.length; i++) {
        setProgress(`Upload foto PRIMA ${i + 1}/${fotoPrima.length}...`)

        const compressed = await compressImage(fotoPrima[i].file)
        const url = await uploadToBlob(compressed, `cliente-${clienteId}-prima-${Date.now()}-${i}.jpg`)

        const addResult = await addFoto(fotoLavoroId, url, 'prima')
        if (!addResult.success) {
          console.error('Errore add foto prima:', addResult.error)
        }
      }

      // 3. Upload and add DOPO photos
      for (let i = 0; i < fotoDopo.length; i++) {
        setProgress(`Upload foto DOPO ${i + 1}/${fotoDopo.length}...`)

        const compressed = await compressImage(fotoDopo[i].file)
        const url = await uploadToBlob(compressed, `cliente-${clienteId}-dopo-${Date.now()}-${i}.jpg`)

        const addResult = await addFoto(fotoLavoroId, url, 'dopo')
        if (!addResult.success) {
          console.error('Errore add foto dopo:', addResult.error)
        }
      }

      setProgress('Completato!')
      onSuccess()
    } catch (error: any) {
      console.error('Errore salvataggio lavoro:', error)
      alert(error.message || 'Errore durante il salvataggio')
      setUploading(false)
      setProgress('')
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center p-6 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Nuovo Lavoro</h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                disabled={uploading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-green-100 mt-1">{clienteNome}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Operatore e Servizio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Operatore *
                </label>
                <select
                  value={operatoreId}
                  onChange={(e) => setOperatoreId(e.target.value)}
                  required
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {operatori.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nome} {op.cognome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Servizio
                </label>
                <select
                  value={servizioId}
                  onChange={(e) => setServizioId(e.target.value)}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Nessuno --</option>
                  {servizi.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={uploading}
                rows={2}
                placeholder="Aggiungi note sul lavoro..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Foto PRIMA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-semibold text-gray-900">
                  📸 PRIMA ({fotoPrima.length}/5)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCamera('prima')}
                  disabled={uploading || fotoPrima.length >= 5}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Aggiungi
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {fotoPrima.map((foto, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={foto.preview}
                      alt={`Prima ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFoto(index, 'prima')}
                      disabled={uploading}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Foto DOPO */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-semibold text-gray-900">
                  📸 DOPO ({fotoDopo.length}/5)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCamera('dopo')}
                  disabled={uploading || fotoDopo.length >= 5}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Aggiungi
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {fotoDopo.map((foto, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={foto.preview}
                      alt={`Dopo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFoto(index, 'dopo')}
                      disabled={uploading}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={uploading || (fotoPrima.length === 0 && fotoDopo.length === 0)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? progress : '💾 Salva Lavoro'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Uploader */}
      {showCamera && (
        <CameraUploader
          tipo={showCamera}
          onCapture={(file) => handleAddFoto(file, showCamera)}
          onClose={() => setShowCamera(null)}
        />
      )}
    </>
  )
}
