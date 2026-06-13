-- Permite re-enviar una solicitud de intercambio solo cuando la anterior
-- fue rechazada. Bloquea si hay una solicitud pendiente o aprobada.
-- Reemplaza la constraint UNIQUE simple por un índice único parcial.

-- 1. Quitar la constraint simple (si existe)
ALTER TABLE public.intercambios
  DROP CONSTRAINT IF EXISTS intercambios_solicitante_id_receptor_id_key;

-- 2. Quitar índices anteriores si ya se ejecutaron versiones previas
DROP INDEX IF EXISTS intercambios_active_unique;
DROP INDEX IF EXISTS intercambios_pending_unique;

-- 3. Índice único parcial: un solo intercambio activo (pendiente o aprobado) por par
CREATE UNIQUE INDEX IF NOT EXISTS intercambios_active_unique
  ON public.intercambios (solicitante_id, receptor_id)
  WHERE estado IN ('pendiente', 'aprobado');
