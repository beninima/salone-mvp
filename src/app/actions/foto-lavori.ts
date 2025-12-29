'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type FotoLavoroWithFoto = {
  id: string
  clienteId: number
  operatoreId: string
  servizioId: string | null
  data: Date
  note: string | null
  createdAt: Date
  updatedAt: Date
  operatore: {
    id: string
    nome: string
    cognome: string
  }
  servizio: {
    id: string
    nome: string
  } | null
  foto: {
    id: string
    url: string
    tipo: string
    ordine: number
  }[]
}

/**
 * Get all foto lavori for a cliente
 */
export async function getFotoLavoriByCliente(clienteId: number) {
  try {
    const fotoLavori = await prisma.fotoLavoro.findMany({
      where: { clienteId },
      include: {
        operatore: {
          select: {
            id: true,
            nome: true,
            cognome: true
          }
        },
        servizio: {
          select: {
            id: true,
            nome: true
          }
        },
        foto: {
          orderBy: [
            { tipo: 'asc' }, // prima before dopo
            { ordine: 'asc' }
          ]
        }
      },
      orderBy: {
        data: 'desc'
      }
    })

    return { success: true, data: fotoLavori as FotoLavoroWithFoto[] }
  } catch (error) {
    console.error('❌ Errore getFotoLavoriByCliente:', error)
    return { success: false, error: 'Errore nel recupero dei lavori', data: [] }
  }
}

/**
 * Get a single foto lavoro by ID
 */
export async function getFotoLavoroById(id: string) {
  try {
    const fotoLavoro = await prisma.fotoLavoro.findUnique({
      where: { id },
      include: {
        operatore: {
          select: {
            id: true,
            nome: true,
            cognome: true
          }
        },
        servizio: {
          select: {
            id: true,
            nome: true
          }
        },
        foto: {
          orderBy: [
            { tipo: 'asc' },
            { ordine: 'asc' }
          ]
        }
      }
    })

    if (!fotoLavoro) {
      return { success: false, error: 'Lavoro non trovato', data: null }
    }

    return { success: true, data: fotoLavoro as FotoLavoroWithFoto }
  } catch (error) {
    console.error('❌ Errore getFotoLavoroById:', error)
    return { success: false, error: 'Errore nel recupero del lavoro', data: null }
  }
}

/**
 * Create a new foto lavoro
 */
export async function createFotoLavoro(formData: FormData) {
  try {
    const clienteId = parseInt(formData.get('clienteId') as string)
    const operatoreId = formData.get('operatoreId') as string
    const servizioId = formData.get('servizioId') as string || null
    const note = formData.get('note') as string || null

    if (!clienteId || !operatoreId) {
      return { success: false, error: 'Cliente e operatore sono obbligatori' }
    }

    const fotoLavoro = await prisma.fotoLavoro.create({
      data: {
        clienteId,
        operatoreId,
        servizioId,
        note
      }
    })

    console.log('✅ FotoLavoro creato:', fotoLavoro.id)

    revalidatePath(`/clienti/${clienteId}`)
    return { success: true, data: fotoLavoro }
  } catch (error: any) {
    console.error('❌ Errore createFotoLavoro:', error)
    return { success: false, error: `Errore nella creazione: ${error.message}` }
  }
}

/**
 * Add foto to a foto lavoro
 */
export async function addFoto(fotoLavoroId: string, url: string, tipo: 'prima' | 'dopo') {
  try {
    // Get current max ordine for this tipo
    const maxOrdine = await prisma.foto.findFirst({
      where: {
        fotoLavoroId,
        tipo
      },
      orderBy: {
        ordine: 'desc'
      },
      select: {
        ordine: true
      }
    })

    const nextOrdine = (maxOrdine?.ordine || 0) + 1

    // Check if we already have 5 photos of this type
    const count = await prisma.foto.count({
      where: {
        fotoLavoroId,
        tipo
      }
    })

    if (count >= 5) {
      return { success: false, error: `Massimo 5 foto ${tipo} per lavoro` }
    }

    const foto = await prisma.foto.create({
      data: {
        fotoLavoroId,
        url,
        tipo,
        ordine: nextOrdine
      }
    })

    console.log(`✅ Foto ${tipo} aggiunta:`, foto.id)

    // Get cliente ID for revalidation
    const fotoLavoro = await prisma.fotoLavoro.findUnique({
      where: { id: fotoLavoroId },
      select: { clienteId: true }
    })

    if (fotoLavoro) {
      revalidatePath(`/clienti/${fotoLavoro.clienteId}`)
    }

    return { success: true, data: foto }
  } catch (error: any) {
    console.error('❌ Errore addFoto:', error)
    return { success: false, error: `Errore nell'aggiunta della foto: ${error.message}` }
  }
}

/**
 * Remove a foto
 */
export async function removeFoto(fotoId: string) {
  try {
    const foto = await prisma.foto.findUnique({
      where: { id: fotoId },
      include: {
        fotoLavoro: {
          select: { clienteId: true }
        }
      }
    })

    if (!foto) {
      return { success: false, error: 'Foto non trovata' }
    }

    await prisma.foto.delete({
      where: { id: fotoId }
    })

    console.log('✅ Foto rimossa:', fotoId)

    revalidatePath(`/clienti/${foto.fotoLavoro.clienteId}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore removeFoto:', error)
    return { success: false, error: `Errore nella rimozione: ${error.message}` }
  }
}

/**
 * Delete a foto lavoro and all its photos
 */
export async function deleteFotoLavoro(id: string) {
  try {
    const fotoLavoro = await prisma.fotoLavoro.findUnique({
      where: { id },
      select: { clienteId: true }
    })

    if (!fotoLavoro) {
      return { success: false, error: 'Lavoro non trovato' }
    }

    await prisma.fotoLavoro.delete({
      where: { id }
    })

    console.log('✅ FotoLavoro eliminato:', id)

    revalidatePath(`/clienti/${fotoLavoro.clienteId}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore deleteFotoLavoro:', error)
    return { success: false, error: `Errore nell'eliminazione: ${error.message}` }
  }
}

/**
 * Update foto lavoro notes
 */
export async function updateFotoLavoroNote(id: string, note: string) {
  try {
    const fotoLavoro = await prisma.fotoLavoro.update({
      where: { id },
      data: { note },
      select: { clienteId: true }
    })

    console.log('✅ Note aggiornate per lavoro:', id)

    revalidatePath(`/clienti/${fotoLavoro.clienteId}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore updateFotoLavoroNote:', error)
    return { success: false, error: `Errore nell'aggiornamento: ${error.message}` }
  }
}
