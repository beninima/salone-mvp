-- CreateTable
CREATE TABLE "servizi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "prezzo" REAL NOT NULL,
    "durata" INTEGER NOT NULL DEFAULT 60,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insert default services
INSERT INTO "servizi" ("id", "nome", "prezzo", "durata", "attivo", "createdAt", "updatedAt") VALUES
  ('svc_taglio', 'Taglio', 25.00, 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('svc_piega', 'Piega', 20.00, 45, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('svc_colore', 'Colore', 45.00, 90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('svc_meches', 'Mèches', 60.00, 120, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('svc_trattamento', 'Trattamento', 35.00, 60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('svc_taglio_piega', 'Taglio + Piega', 40.00, 75, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('svc_taglio_colore', 'Taglio + Colore', 65.00, 120, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
