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
        cliente: true,
        operatore: true,
        servizi: {
          include: {
            servizio: true
          },
          orderBy: {
            ordine: 'asc'
          }
        }
      },
      orderBy: { dataOra: 'asc' }
    })

    return { success: true, data: appuntamenti }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero degli appuntamenti' }
  }
}

/**
 * Check if an operator has overlapping appointments
 */
async function hasOverlappingAppointment(
  operatoreId: string,
  dataOra: Date,
  durata: number,
  excludeAppuntamentoId?: number
): Promise<{ hasConflict: boolean; conflictDetails?: string }> {
  const endTime = new Date(dataOra.getTime() + durata * 60000)

  const conflictingAppointments = await prisma.appuntamento.findMany({
    where: {
      operatoreId,
      id: excludeAppuntamentoId ? { not: excludeAppuntamentoId } : undefined,
      AND: [
        {
          dataOra: {
            lt: endTime
          }
        },
        {
          OR: [
            {
              dataOra: {
                gte: dataOra
              }
            },
            {
              // Check if existing appointment end time overlaps with new appointment start
              AND: [
                {
                  dataOra: {
                    lt: dataOra
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    include: {
      cliente: true
    }
  })

  // More precise overlap check
  for (const existing of conflictingAppointments) {
    const existingEnd = new Date(existing.dataOra.getTime() + existing.durata * 60000)
    
    // Check if there's actual overlap
    if (dataOra < existingEnd && endTime > existing.dataOra) {
      const timeStr = existing.dataOra.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      return {
        hasConflict: true,
        conflictDetails: `L'operatore ha già un appuntamento con ${existing.cliente.nome} ${existing.cliente.cognome} alle ${timeStr}`
      }
    }
  }

  return { hasConflict: false }
}

export async function createAppuntamento(formData: FormData) {
  try {
    const clienteId = parseInt(formData.get('clienteId') as string)
    const operatoreId = formData.get('operatoreId') as string
    const data = formData.get('data') as string
    const ora = formData.get('ora') as string
    const servizioId = formData.get('servizio') as string // Ora è l'ID del servizio
    const durata = parseInt(formData.get('durata') as string)

    if (!clienteId || !operatoreId || !data || !ora || !servizioId || !durata) {
      return { success: false, error: 'Tutti i campi sono obbligatori' }
    }

    const dataOra = new Date(`${data}T${ora}`)

    // Check for overlapping appointments for this operator
    const overlap = await hasOverlappingAppointment(operatoreId, dataOra, durata)
    if (overlap.hasConflict) {
      return { success: false, error: overlap.conflictDetails || 'L\'operatore ha già un appuntamento in questo orario' }
    }

    // Crea l'appuntamento con la relazione al servizio
    await prisma.appuntamento.create({
      data: {
        clienteId,
        operatoreId,
        dataOra,
        durata,
        stato: 'confermato',
        servizi: {
          create: {
            servizioId,
            ordine: 1
          }
        }
      }
    })

    revalidatePath('/appuntamenti')
    return { success: true }
  } catch (error) {
    console.error('Errore createAppuntamento:', error)
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
        cliente: true,
        operatore: true,
        servizi: {
          include: {
            servizio: true
          },
          orderBy: {
            ordine: 'asc'
          }
        }
      },
      orderBy: { dataOra: 'asc' }
    })

    return { success: true, data: appuntamenti, startOfWeek, endOfWeek }
  } catch (error) {
    return { success: false, error: 'Errore nel recupero degli appuntamenti settimanali' }
  }
}

/**
 * Get appointments grouped by operator for a specific date range
 */
export async function getAppuntamentiByOperatoreAndDateRange(startDate: Date, endDate: Date) {
  try {
    const appuntamenti = await prisma.appuntamento.findMany({
      where: {
        dataOra: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        cliente: true,
        operatore: true,
        servizi: {
          include: {
            servizio: true
          },
          orderBy: {
            ordine: 'asc'
          }
        }
      },
      orderBy: [
        { operatoreId: 'asc' },
        { dataOra: 'asc' }
      ]
    })

    // Group by operator
    const grouped = appuntamenti.reduce((acc, app) => {
      const operatoreId = app.operatoreId
      if (!acc[operatoreId]) {
        acc[operatoreId] = {
          operatore: app.operatore,
          appuntamenti: []
        }
      }
      acc[operatoreId].appuntamenti.push(app)
      return acc
    }, {} as Record<string, { operatore: any; appuntamenti: any[] }>)

    return { success: true, data: grouped }
  } catch (error) {
    console.error('Errore getAppuntamentiByOperatore:', error)
    return { success: false, error: 'Errore nel recupero degli appuntamenti per operatore' }
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
