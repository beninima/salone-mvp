-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appuntamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "operatoreId" TEXT NOT NULL,
    "dataOra" DATETIME NOT NULL,
    "servizio" TEXT NOT NULL,
    "durata" INTEGER NOT NULL,
    "stato" TEXT NOT NULL DEFAULT 'confermato',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appuntamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appuntamento_operatoreId_fkey" FOREIGN KEY ("operatoreId") REFERENCES "operatori" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Appuntamento" ("clienteId", "createdAt", "dataOra", "durata", "id", "operatoreId", "servizio", "stato", "updatedAt") SELECT "clienteId", "createdAt", "dataOra", "durata", "id", "operatoreId", "servizio", "stato", "updatedAt" FROM "Appuntamento";
DROP TABLE "Appuntamento";
ALTER TABLE "new_Appuntamento" RENAME TO "Appuntamento";
CREATE UNIQUE INDEX "Appuntamento_operatoreId_dataOra_key" ON "Appuntamento"("operatoreId", "dataOra");
CREATE TABLE "new_operatori" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "colore" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_operatori" ("attivo", "cognome", "colore", "createdAt", "id", "nome", "updatedAt") SELECT "attivo", "cognome", "colore", "createdAt", "id", "nome", "updatedAt" FROM "operatori";
DROP TABLE "operatori";
ALTER TABLE "new_operatori" RENAME TO "operatori";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
