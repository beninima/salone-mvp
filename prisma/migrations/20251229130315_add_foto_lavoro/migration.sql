-- CreateTable
CREATE TABLE "foto_lavori" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" INTEGER NOT NULL,
    "operatoreId" TEXT NOT NULL,
    "servizioId" TEXT,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "foto_lavori_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "foto_lavori_operatoreId_fkey" FOREIGN KEY ("operatoreId") REFERENCES "operatori" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "foto_lavori_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "servizi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "foto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fotoLavoroId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "foto_fotoLavoroId_fkey" FOREIGN KEY ("fotoLavoroId") REFERENCES "foto_lavori" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "foto_fotoLavoroId_idx" ON "foto"("fotoLavoroId");

-- CreateIndex
CREATE UNIQUE INDEX "foto_fotoLavoroId_tipo_ordine_key" ON "foto"("fotoLavoroId", "tipo", "ordine");
