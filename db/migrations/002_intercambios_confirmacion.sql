-- Confirmación independiente por cada usuario del intercambio.
-- laminas_solicitante: lo que el solicitante confirma dar.
-- laminas_receptor:    lo que el receptor confirma dar.
-- El intercambio pasa a 'completado' cuando ambos confirman.

ALTER TABLE public.intercambios
  ADD COLUMN IF NOT EXISTS laminas_solicitante    integer[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS laminas_receptor       integer[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmado_solicitante BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmado_receptor    BOOLEAN   NOT NULL DEFAULT FALSE;
