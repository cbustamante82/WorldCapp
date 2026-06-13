-- Tabla de solicitudes de intercambio de láminas entre usuarios.
-- Un par (solicitante, receptor) es único; el receptor aprueba o rechaza.

CREATE TABLE IF NOT EXISTS public.intercambios (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receptor_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado         TEXT        NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_exchange CHECK (solicitante_id != receptor_id),
  UNIQUE (solicitante_id, receptor_id)
);

ALTER TABLE public.intercambios ENABLE ROW LEVEL SECURITY;
