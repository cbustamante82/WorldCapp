-- Agrega columnas para registrar las láminas confirmadas en el intercambio.
-- laminas_doy / laminas_recibo se almacenan desde la perspectiva del solicitante.

ALTER TABLE public.intercambios
  ADD COLUMN IF NOT EXISTS laminas_doy    integer[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS laminas_recibo integer[] DEFAULT NULL;
