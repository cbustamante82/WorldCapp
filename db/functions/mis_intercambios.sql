-- Retorna todos los intercambios del usuario autenticado, enriquecidos con
-- nombre y email del otro participante. Incluye el flag es_solicitante para
-- que el cliente distinga el rol sin comparar UUIDs.
-- Las columnas laminas_* y confirmado_* se almacenan desde la perspectiva del solicitante.
-- SECURITY DEFINER: accede a auth.users sin exponerlo al cliente.

CREATE OR REPLACE FUNCTION public.mis_intercambios()
RETURNS TABLE (
  id                      UUID,
  solicitante_id          UUID,
  receptor_id             UUID,
  estado                  TEXT,
  created_at              TIMESTAMPTZ,
  otro_usuario_email      TEXT,
  otro_usuario_nombre     TEXT,
  es_solicitante          BOOLEAN,
  laminas_solicitante     integer[],
  laminas_receptor        integer[],
  confirmado_solicitante  BOOLEAN,
  confirmado_receptor     BOOLEAN
)
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    i.id,
    i.solicitante_id,
    i.receptor_id,
    i.estado,
    i.created_at,
    CASE WHEN i.solicitante_id = auth.uid() THEN u2.email ELSE u1.email END,
    CASE WHEN i.solicitante_id = auth.uid()
         THEN COALESCE(u2.raw_user_meta_data->>'name', split_part(u2.email, '@', 1))
         ELSE COALESCE(u1.raw_user_meta_data->>'name', split_part(u1.email, '@', 1))
    END,
    (i.solicitante_id = auth.uid()),
    i.laminas_solicitante,
    i.laminas_receptor,
    i.confirmado_solicitante,
    i.confirmado_receptor
  FROM public.intercambios i
  JOIN auth.users u1 ON u1.id = i.solicitante_id
  JOIN auth.users u2 ON u2.id = i.receptor_id
  WHERE i.solicitante_id = auth.uid() OR i.receptor_id = auth.uid()
  ORDER BY i.created_at DESC;
$$;
