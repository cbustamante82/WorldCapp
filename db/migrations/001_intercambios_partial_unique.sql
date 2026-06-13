-- Permite re-enviar una solicitud de intercambio cuando la anterior fue
-- rechazada o aprobada. Solo bloquea si hay una solicitud pendiente.
-- Reemplaza la constraint UNIQUE simple por un índice único parcial.

-- 1. Quitar la constraint simple (si existe)
ALTER TABLE public.intercambios
  DROP CONSTRAINT IF EXISTS intercambios_solicitante_id_receptor_id_key;

-- 2. Quitar índice anterior si se ejecutó la versión previa de esta migración
DROP INDEX IF EXISTS intercambios_active_unique;

-- 3. Índice único parcial: solo un intercambio pendiente por par de usuarios
CREATE UNIQUE INDEX IF NOT EXISTS intercambios_pending_unique
  ON public.intercambios (solicitante_id, receptor_id)
  WHERE estado = 'pendiente';
