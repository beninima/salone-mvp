'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getOperatori() {
  try {
    const operatori = await prisma.operatore.findMany({
      orderBy: [
        { attivo: 'desc' },
        { cognome: 'asc' },
        { nome: 'asc' }
      ]
    })
    return { success: true, data: operatori }
  } catch (error) {
    console.error('Errore getOperatori:', error)
    return { success: false, error: 'Errore nel recupero degli operatori', data: [] }
  }
}

export async function getOperatoriAttivi() {
  try {
    const operatori = await prisma.operatore.findMany({
      where: { attivo: true },
      orderBy: [
        { cognome: 'asc' },
        { nome: 'asc' }
      ],
      select: {
        id: true,
        nome: true,
        cognome: true,
        colore: true
      }
    })
    return { success: true, data: operatori }
  } catch (error) {
    console.error('Errore getOperatoriAttivi:', error)
    return { success: false, error: 'Errore nel recupero degli operatori attivi', data: [] }
  }
}

export async function createOperatore(formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const cognome = formData.get('cognome') as string
    const colore = formData.get('colore') as string
    const attivo = formData.get('attivo') === 'true'

    console.log('📝 Creazione operatore:', { nome, cognome, colore, attivo })

    if (!nome || !cognome) {
      return { success: false, error: 'Nome e cognome sono obbligatori' }
    }

    const operatore = await prisma.operatore.create({
      data: {
        nome: nome.trim(),
        cognome: cognome.trim(),
        colore: colore || null,
        attivo
      }
    })

    console.log('✅ Operatore creato:', operatore)

    revalidatePath('/operatori')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore createOperatore completo:', error)
    console.error('Dettagli errore:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return {
      success: false,
      error: `Errore nella creazione: ${error.message || 'Errore sconosciuto'}`
    }
  }
}

export async function updateOperatore(id: string, formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const cognome = formData.get('cognome') as string
    const colore = formData.get('colore') as string
    const attivo = formData.get('attivo') === 'true'

    if (!nome || !cognome) {
      return { success: false, error: 'Nome e cognome sono obbligatori' }
    }

    await prisma.operatore.update({
      where: { id },
      data: {
        nome,
        cognome,
        colore: colore || null,
        attivo
      }
    })

    revalidatePath('/operatori')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('Errore updateOperatore:', error)
    return { success: false, error: 'Errore nell\'aggiornamento dell\'operatore' }
  }
}

export async function toggleOperatoreAttivo(id: string, attivo: boolean) {
  try {
    await prisma.operatore.update({
      where: { id },
      data: { attivo }
    })

    revalidatePath('/operatori')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('Errore toggleOperatoreAttivo:', error)
    return { success: false, error: 'Errore nell\'aggiornamento dello stato' }
  }
}

export async function deleteOperatore(id: string) {
  try {
    // Check if operator has appointments
    const appuntamentiCount = await prisma.appuntamento.count({
      where: { operatoreId: id }
    })

    if (appuntamentiCount > 0) {
      return { 
        success: false, 
        error: `Impossibile eliminare: l'operatore ha ${appuntamentiCount} appuntamenti associati` 
      }
    }

    await prisma.operatore.delete({
      where: { id }
    })

    revalidatePath('/operatori')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('Errore deleteOperatore:', error)
    return { success: false, error: 'Errore nell\'eliminazione dell\'operatore' }
  }
}
