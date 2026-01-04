'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getClienti() {
  try {
    const clienti = await prisma.cliente.findMany({
      orderBy: { cognome: 'asc' },
      include: {
        appuntamenti: {
          orderBy: { dataOra: 'desc' }
        },
        interventi: {
          include: {
            prodotti: {
              include: {
                prodotto: true
              }
            }
          }
        }
      }
    })
    return { success: true, data: clienti }
  } catch (error) {
    console.error('Errore getClienti:', error)
    return { success: false, error: 'Errore nel recupero dei clienti', data: [] }
  }
}

export async function getCliente(id: number) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id }
    })
    return { success: true, data: cliente }
  } catch (error) {
    return { success: false, error: 'Cliente non trovato' }
  }
}

export async function getClienteById(id: number) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        cognome: true,
        cellulare: true,
        note: true
      }
    })
    return { success: true, data: cliente }
  } catch (error) {
    return { success: false, error: 'Cliente non trovato', data: null }
  }
}

export async function createCliente(formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const cognome = formData.get('cognome') as string
    const cellulare = formData.get('cellulare') as string
    const note = formData.get('note') as string

    if (!nome || !cognome) {
      return { success: false, error: 'Nome e cognome sono obbligatori' }
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cognome,
        cellulare: cellulare || null,
        note: note || null
      }
    })

    revalidatePath('/clienti')
    return { success: true, data: cliente }
  } catch (error) {
    return { success: false, error: 'Errore nella creazione del cliente' }
  }
}

export async function updateCliente(id: number, formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const cognome = formData.get('cognome') as string
    const cellulare = formData.get('cellulare') as string
    const note = formData.get('note') as string

    if (!nome || !cognome) {
      return { success: false, error: 'Nome e cognome sono obbligatori' }
    }

    await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        cognome,
        cellulare: cellulare || null,
        note: note || null
      }
    })

    revalidatePath('/clienti')
    revalidatePath(`/clienti/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'aggiornamento del cliente' }
  }
}

export async function deleteCliente(id: number) {
  try {
    await prisma.cliente.delete({
      where: { id }
    })

    revalidatePath('/clienti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'eliminazione del cliente' }
  }
}
