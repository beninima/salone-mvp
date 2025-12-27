'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProdotti() {
  try {
    const prodotti = await prisma.prodotto.findMany({
      orderBy: { nome: 'asc' }
    })
    return { success: true, data: prodotti }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero dei prodotti' }
  }
}

export async function createProdotto(formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const descrizione = formData.get('descrizione') as string
    const prezzo = parseFloat(formData.get('prezzo') as string)

    if (!nome || !prezzo) {
      return { success: false, error: 'Nome e prezzo sono obbligatori' }
    }

    await prisma.prodotto.create({
      data: {
        nome,
        descrizione: descrizione || null,
        prezzo
      }
    })

    revalidatePath('/prodotti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nella creazione del prodotto' }
  }
}

export async function updateProdotto(id: number, formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const descrizione = formData.get('descrizione') as string
    const prezzo = parseFloat(formData.get('prezzo') as string)

    if (!nome || !prezzo) {
      return { success: false, error: 'Nome e prezzo sono obbligatori' }
    }

    await prisma.prodotto.update({
      where: { id },
      data: {
        nome,
        descrizione: descrizione || null,
        prezzo
      }
    })

    revalidatePath('/prodotti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'aggiornamento del prodotto' }
  }
}

export async function deleteProdotto(id: number) {
  try {
    await prisma.prodotto.delete({
      where: { id }
    })

    revalidatePath('/prodotti')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Errore nell\'eliminazione del prodotto' }
  }
}
