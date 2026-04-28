-- Adds ficha JSONB to especies: ciclo_vida, maduracion, wiki provenance metadata
ALTER TABLE especies ADD COLUMN IF NOT EXISTS ficha JSONB;
