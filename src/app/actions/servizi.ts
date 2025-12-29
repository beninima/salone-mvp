'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getServizi() {
  try {
    const servizi = await prisma.servizio.findMany({
      orderBy: [
        { attivo: 'desc' },
        { nome: 'asc' }
      ]
    })
    return { success: true, data: servizi }
  } catch (error) {
    console.error('❌ Errore getServizi:', error)
    return { success: false, error: 'Errore nel recupero dei servizi', data: [] }
  }
}

export async function getServiziAttivi() {
  try {
    const servizi = await prisma.servizio.findMany({
      where: { attivo: true },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        prezzo: true,
        durata: true
      }
    })
    return { success: true, data: servizi }
  } catch (error) {
    console.error('❌ Errore getServiziAttivi:', error)
    return { success: false, error: 'Errore nel recupero dei servizi attivi', data: [] }
  }
}

export async function createServizio(formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const prezzoStr = formData.get('prezzo') as string
    const durataStr = formData.get('durata') as string
    const attivo = formData.get('attivo') === 'true'

    console.log('📝 Creazione servizio:', { nome, prezzo: prezzoStr, durata: durataStr, attivo })

    if (!nome) {
      return { success: false, error: 'Il nome è obbligatorio' }
    }

    const prezzo = parseFloat(prezzoStr)
    if (isNaN(prezzo) || prezzo < 0) {
      return { success: false, error: 'Il prezzo deve essere un numero valido' }
    }

    const durata = parseInt(durataStr)
    if (isNaN(durata) || durata < 15 || durata > 240) {
      return { success: false, error: 'La durata deve essere tra 15 e 240 minuti' }
    }

    const servizio = await prisma.servizio.create({
      data: {
        nome: nome.trim(),
        prezzo,
        durata,
        attivo
      }
    })

    console.log('✅ Servizio creato:', servizio)

    revalidatePath('/servizi')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore createServizio completo:', error)
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

export async function updateServizio(id: string, formData: FormData) {
  try {
    const nome = formData.get('nome') as string
    const prezzoStr = formData.get('prezzo') as string
    const durataStr = formData.get('durata') as string
    const attivo = formData.get('attivo') === 'true'

    if (!nome) {
      return { success: false, error: 'Il nome è obbligatorio' }
    }

    const prezzo = parseFloat(prezzoStr)
    if (isNaN(prezzo) || prezzo < 0) {
      return { success: false, error: 'Il prezzo deve essere un numero valido' }
    }

    const durata = parseInt(durataStr)
    if (isNaN(durata) || durata < 15 || durata > 240) {
      return { success: false, error: 'La durata deve essere tra 15 e 240 minuti' }
    }

    await prisma.servizio.update({
      where: { id },
      data: {
        nome: nome.trim(),
        prezzo,
        durata,
        attivo
      }
    })

    revalidatePath('/servizi')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('❌ Errore updateServizio:', error)
    return { success: false, error: 'Errore nell\'aggiornamento del servizio' }
  }
}

export async function toggleServizioAttivo(id: string, attivo: boolean) {
  try {
    await prisma.servizio.update({
      where: { id },
      data: { attivo }
    })

    revalidatePath('/servizi')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('❌ Errore toggleServizioAttivo:', error)
    return { success: false, error: 'Errore nell\'aggiornamento dello stato' }
  }
}

export async function deleteServizio(id: string) {
  try {
    // Note: In future, check if service is used in appointments
    // For now, we'll allow deletion since Appuntamento.servizio is a string field

    await prisma.servizio.delete({
      where: { id }
    })

    revalidatePath('/servizi')
    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('❌ Errore deleteServizio:', error)
    return { success: false, error: 'Errore nell\'eliminazione del servizio' }
  }
}
