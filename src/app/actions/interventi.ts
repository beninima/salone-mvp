'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getInterventi() {
  try {
    const interventi = await prisma.intervento.findMany({
      include: {
        cliente: true,
        prodotti: {
          include: {
            prodotto: true
          }
        }
      },
      orderBy: { data: 'desc' }
    })
    return { success: true, data: interventi }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero degli interventi' }
  }
}

export async function createIntervento(formData: FormData) {
  try {
    const clienteId = parseInt(formData.get('clienteId') as string)
    const descrizione = formData.get('descrizione') as string
    const data = formData.get('data') as string
    const prodottiJson = formData.get('prodotti') as string

    if (!clienteId || !descrizione) {
      return { success: false, error: 'Cliente e descrizione sono obbligatori' }
    }

    const prodotti = prodottiJson ? JSON.parse(prodottiJson) : []

    const dataIntervento = data ? new Date(data) : new Date()

    const intervento = await prisma.intervento.create({
      data: {
        clienteId,
        descrizione,
        data: dataIntervento,
        prodotti: {
          create: prodotti.map((p: { prodottoId: number; quantita: number }) => ({
            prodottoId: p.prodottoId,
            quantita: p.quantita
          }))
        }
      }
    })

    revalidatePath('/interventi')
    return { success: true, data: intervento }
  } catch (error) {
    console.error('Errore creazione intervento:', error)
    return { success: false, error: 'Errore nella creazione dell\'intervento' }
  }
}

export async function deleteIntervento(id: number) {
  try {
    await prisma.intervento.delete({
      where: { id }
    })

    revalidatePath('/interventi')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'eliminazione dell\'intervento' }
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

export async function getProdottiForSelect() {
  try {
    const prodotti = await prisma.prodotto.findMany({
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        prezzo: true
      }
    })
    return { success: true, data: prodotti }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero dei prodotti' }
  }
}
