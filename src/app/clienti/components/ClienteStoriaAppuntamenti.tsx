'use client'

import { useState } from 'react'

type Prodotto = {
  id: number
  nome: string
}

type InterventoProdotto = {
  quantita: number
  prodotto: Prodotto
}

type Intervento = {
  id: number
  descrizione: string
  data: Date
  prodotti: InterventoProdotto[]
}

type Appuntamento = {
  id: number
  dataOra: Date
  servizio: string
  durata: number
  stato: string
}

export default function ClienteStoriaAppuntamenti({
  appuntamenti,
  interventi
}: {
  appuntamenti: Appuntamento[]
  interventi: Intervento[]
}) {
  const [expanded, setExpanded] = useState(false)

  if (!appuntamenti || appuntamenti.length === 0) {
    return null
  }

  const appuntamentiCompletati = appuntamenti.filter(app => app.stato === 'completato')

  if (appuntamentiCompletati.length === 0 && interventi.length === 0) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-base text-gray-600 hover:text-gray-900"
      >
        <span className="font-medium">
          Storia Appuntamenti ({appuntamentiCompletati.length})
        </span>
        <span className="text-xs">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {appuntamentiCompletati.map((app) => (
            <div
              key={app.id}
              className="bg-gray-50 rounded p-2 text-xs"
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-semibold">{formatDate(app.dataOra)}</div>
                  <div className="text-gray-600">{app.servizio}</div>
                </div>
              </div>
            </div>
          ))}

          {interventi.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">Interventi:</div>
              {interventi.map((intervento) => (
                <div key={intervento.id} className="bg-green-50 rounded p-2 text-xs mb-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{formatDate(intervento.data)}</div>
                      <div className="text-gray-700">{intervento.descrizione}</div>
                      {intervento.prodotti.length > 0 && (
                        <div className="mt-1 text-gray-500 text-[10px]">
                          Prodotti: {intervento.prodotti.map(p =>
                            `${p.prodotto.nome} (${p.quantita})`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
