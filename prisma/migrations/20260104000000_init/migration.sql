-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "cellulare" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operatori" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "colore" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operatori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appuntamento" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "operatoreId" TEXT NOT NULL,
    "dataOra" TIMESTAMP(3) NOT NULL,
    "durata" INTEGER NOT NULL,
    "stato" TEXT NOT NULL DEFAULT 'confermato',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appuntamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppuntamentoServizio" (
    "appuntamentoId" INTEGER NOT NULL,
    "servizioId" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppuntamentoServizio_pkey" PRIMARY KEY ("appuntamentoId","servizioId")
);

-- CreateTable
CREATE TABLE "Intervento" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descrizione" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prodotto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "prezzo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodotto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventoProdotto" (
    "interventoId" INTEGER NOT NULL,
    "prodottoId" INTEGER NOT NULL,
    "quantita" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterventoProdotto_pkey" PRIMARY KEY ("interventoId","prodottoId")
);

-- CreateTable
CREATE TABLE "servizi" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "prezzo" DOUBLE PRECISION NOT NULL,
    "durata" INTEGER NOT NULL DEFAULT 60,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servizi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_lavori" (
    "id" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "operatoreId" TEXT NOT NULL,
    "servizioId" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foto_lavori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto" (
    "id" TEXT NOT NULL,
    "fotoLavoroId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appuntamento_operatoreId_dataOra_key" ON "Appuntamento"("operatoreId", "dataOra");

-- CreateIndex
CREATE UNIQUE INDEX "foto_fotoLavoroId_tipo_ordine_key" ON "foto"("fotoLavoroId", "tipo", "ordine");

-- CreateIndex
CREATE INDEX "foto_fotoLavoroId_idx" ON "foto"("fotoLavoroId");

-- AddForeignKey
ALTER TABLE "Appuntamento" ADD CONSTRAINT "Appuntamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appuntamento" ADD CONSTRAINT "Appuntamento_operatoreId_fkey" FOREIGN KEY ("operatoreId") REFERENCES "operatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppuntamentoServizio" ADD CONSTRAINT "AppuntamentoServizio_appuntamentoId_fkey" FOREIGN KEY ("appuntamentoId") REFERENCES "Appuntamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppuntamentoServizio" ADD CONSTRAINT "AppuntamentoServizio_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "servizi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervento" ADD CONSTRAINT "Intervento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventoProdotto" ADD CONSTRAINT "InterventoProdotto_interventoId_fkey" FOREIGN KEY ("interventoId") REFERENCES "Intervento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventoProdotto" ADD CONSTRAINT "InterventoProdotto_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_lavori" ADD CONSTRAINT "foto_lavori_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_lavori" ADD CONSTRAINT "foto_lavori_operatoreId_fkey" FOREIGN KEY ("operatoreId") REFERENCES "operatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_lavori" ADD CONSTRAINT "foto_lavori_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "servizi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto" ADD CONSTRAINT "foto_fotoLavoroId_fkey" FOREIGN KEY ("fotoLavoroId") REFERENCES "foto_lavori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
