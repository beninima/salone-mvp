-- AlterTable: Add cognome field to Operatore and rename table
-- Step 1: Create new table with cognome field
CREATE TABLE "new_operatori" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL DEFAULT '',
    "colore" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Step 2: Copy data from old table, splitting nome into nome/cognome where possible
INSERT INTO "new_operatori" ("id", "nome", "cognome", "colore", "attivo", "createdAt", "updatedAt")
SELECT
    "id",
    CASE
        WHEN instr("nome", ' ') > 0 THEN substr("nome", 1, instr("nome", ' ') - 1)
        ELSE "nome"
    END as "nome",
    CASE
        WHEN instr("nome", ' ') > 0 THEN substr("nome", instr("nome", ' ') + 1)
        ELSE ''
    END as "cognome",
    "colore",
    "attivo",
    "createdAt",
    "updatedAt"
FROM "Operatore";

-- Step 3: Drop old table
DROP TABLE "Operatore";

-- Step 4: Rename new table
ALTER TABLE "new_operatori" RENAME TO "operatori";

-- Recreate foreign key constraints (if needed by updating Appuntamento table reference)
-- The foreign key will automatically reference the new table name
