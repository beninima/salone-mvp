/*
  Warnings:

  - Added the required column `operatoreId` to the `Appuntamento` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "Operatore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "colore" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insert default operator for existing appointments
INSERT INTO "Operatore" ("id", "nome", "colore", "attivo", "createdAt", "updatedAt") 
VALUES ('default-operator-001', 'Operatore Principale', '#3B82F6', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
    CONSTRAINT "Appuntamento_operatoreId_fkey" FOREIGN KEY ("operatoreId") REFERENCES "Operatore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing appointments to default operator
INSERT INTO "new_Appuntamento" ("id", "clienteId", "operatoreId", "dataOra", "servizio", "durata", "stato", "createdAt", "updatedAt") 
SELECT "id", "clienteId", 'default-operator-001', "dataOra", "servizio", "durata", "stato", "createdAt", "updatedAt" 
FROM "Appuntamento";

DROP TABLE "Appuntamento";
ALTER TABLE "new_Appuntamento" RENAME TO "Appuntamento";
CREATE UNIQUE INDEX "Appuntamento_operatoreId_dataOra_key" ON "Appuntamento"("operatoreId", "dataOra");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
