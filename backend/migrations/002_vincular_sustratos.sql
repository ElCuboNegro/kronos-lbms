-- Migration: Vincular sustratos con formulaciones y lotes
ALTER TABLE sustratos ADD COLUMN formulacion_id UUID REFERENCES formulaciones(id);
ALTER TABLE sustratos ADD COLUMN lote_id UUID REFERENCES lotes_preparados(id);
