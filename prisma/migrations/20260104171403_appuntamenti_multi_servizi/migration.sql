-- CreateTable
CREATE TABLE "AppuntamentoServizio" (
    "appuntamentoId" INTEGER NOT NULL,
    "servizioId" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("appuntamentoId", "servizioId"),
    CONSTRAINT "AppuntamentoServizio_appuntamentoId_fkey" FOREIGN KEY ("appuntamentoId") REFERENCES "Appuntamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppuntamentoServizio_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "servizi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migra i dati esistenti
INSERT INTO "AppuntamentoServizio" ("appuntamentoId", "servizioId", "ordine")
SELECT 
    a.id,
    s.id,
    1
FROM "Appuntamento" a
JOIN "servizi" s ON LOWER(s.nome) = LOWER(a.servizio);

-- Rimuovi il campo servizio
CREATE TABLE "Appuntamento_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "operatoreId" TEXT NOT NULL,
    "dataOra" DATETIME NOT NULL,
    "durata" INTEGER NOT NULL,
    "stato" TEXT NOT NULL DEFAULT 'confermato',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appuntamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appuntamento_operatoreId_fkey" FOREIGN KEY ("operatoreId") REFERENCES "operatori" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Appuntamento_new" SELECT "id", "clienteId", "operatoreId", "dataOra", "durata", "stato", "createdAt", "updatedAt" FROM "Appuntamento";
DROP TABLE "Appuntamento";
ALTER TABLE "Appuntamento_new" RENAME TO "Appuntamento";
CREATE UNIQUE INDEX "Appuntamento_operatoreId_dataOra_key" ON "Appuntamento"("operatoreId", "dataOra");
