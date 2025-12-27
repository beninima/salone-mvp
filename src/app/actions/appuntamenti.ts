'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAppuntamentiByDate(date: string) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appuntamenti = await prisma.appuntamento.findMany({
      where: {
        dataOra: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        cliente: true
      },
      orderBy: { dataOra: 'asc' }
    })

    return { success: true, data: appuntamenti }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero degli appuntamenti' }
  }
}

export async function createAppuntamento(formData: FormData) {
  try {
    const clienteId = parseInt(formData.get('clienteId') as string)
    const data = formData.get('data') as string
    const ora = formData.get('ora') as string
    const servizio = formData.get('servizio') as string
    const durata = parseInt(formData.get('durata') as string)

    if (!clienteId || !data || !ora || !servizio || !durata) {
      return { success: false, error: 'Tutti i campi sono obbligatori' }
    }

    const dataOra = new Date(`${data}T${ora}`)

    await prisma.appuntamento.create({
      data: {
        clienteId,
        dataOra,
        servizio,
        durata,
        stato: 'confermato'
      }
    })

    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nella creazione dell\'appuntamento' }
  }
}

export async function updateAppuntamentoStato(id: number, stato: string) {
  try {
    await prisma.appuntamento.update({
      where: { id },
      data: { stato }
    })

    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'aggiornamento dello stato' }
  }
}

export async function deleteAppuntamento(id: number) {
  try {
    await prisma.appuntamento.delete({
      where: { id }
    })

    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'eliminazione dell\'appuntamento' }
  }
}

export async function getAppuntamentiByWeek(date: string) {
  try {
    const selectedDate = new Date(date)

    // Trova il lunedì della settimana
    const dayOfWeek = selectedDate.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Se domenica, torna indietro di 6 giorni
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() + diff)
    startOfWeek.setHours(0, 0, 0, 0)

    // Trova la domenica della settimana
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const appuntamenti = await prisma.appuntamento.findMany({
      where: {
        dataOra: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        cliente: true
      },
      orderBy: { dataOra: 'asc' }
    })

    return { success: true, data: appuntamenti, startOfWeek, endOfWeek }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero degli appuntamenti settimanali' }
  }
}

export async function getClientiForSelect() {
  try {
    const clienti = await prisma.cliente.findMany({
      orderBy: { cognome: 'asc' },
      select: {
        id: true,
        nome: true,
        cognome: true
      }
    })
    return { success: true, data: clienti }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero dei clienti' }
  }
}
