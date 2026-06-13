-- Permite re-enviar una solicitud de intercambio cuando la anterior fue rechazada.
-- Reemplaza la constraint UNIQUE simple por un índice único parcial que solo
-- aplica cuando el estado es 'pendiente' o 'aprobado'.

-- 1. Quitar la constraint simple
ALTER TABLE public.intercambios
  DROP CONSTRAINT IF EXISTS intercambios_solicitante_id_receptor_id_key;

-- 2. Índice único parcial: solo un intercambio activo por par de usuarios
CREATE UNIQUE INDEX IF NOT EXISTS intercambios_active_unique
  ON public.intercambios (solicitante_id, receptor_id)
  WHERE estado IN ('pendiente', 'aprobado');
