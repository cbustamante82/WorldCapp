-- Confirmación independiente por cada usuario del intercambio.
-- Idempotente: puede ejecutarse aunque la versión anterior ya se haya aplicado.
-- Migra datos existentes de laminas_doy/recibo antes de eliminar esas columnas.

-- Paso 1: agregar columnas nuevas (IF NOT EXISTS para ser idempotente)
ALTER TABLE public.intercambios
  ADD COLUMN IF NOT EXISTS laminas_solicitante    integer[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS laminas_receptor       integer[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmado_solicitante BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmado_receptor    BOOLEAN   NOT NULL DEFAULT FALSE;

-- Paso 2: migrar datos de la versión anterior (si las columnas aún existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'intercambios'
      AND column_name  = 'laminas_doy'
  ) THEN
    -- laminas_doy  = lo que da el solicitante → laminas_solicitante
    -- laminas_recibo = lo que da el receptor  → laminas_receptor
    UPDATE public.intercambios
    SET
      laminas_solicitante    = laminas_doy,
      laminas_receptor       = laminas_recibo,
      -- Si estaba completado con el flujo anterior, marcar ambos como confirmados
      confirmado_solicitante = (estado = 'completado' OR laminas_doy    IS NOT NULL),
      confirmado_receptor    = (estado = 'completado' OR laminas_recibo IS NOT NULL)
    WHERE laminas_solicitante IS NULL
      AND (laminas_doy IS NOT NULL OR estado = 'completado');
  END IF;
END;
$$;

-- Paso 3: eliminar columnas de la versión anterior
ALTER TABLE public.intercambios
  DROP COLUMN IF EXISTS laminas_doy,
  DROP COLUMN IF EXISTS laminas_recibo;
