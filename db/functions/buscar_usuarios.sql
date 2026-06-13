-- Búsqueda parcial de usuarios para el autocomplete del intercambio.
-- Coincide con cualquier parte del email o del nombre (ILIKE).
-- Los emails con prefijo exacto aparecen primero. Retorna hasta 8 resultados.
-- SECURITY DEFINER: accede a auth.users sin exponerlo al cliente.

CREATE OR REPLACE FUNCTION public.buscar_usuarios(query_input TEXT)
RETURNS TABLE (user_id UUID, email TEXT, nombre TEXT)
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    id                                                                  AS user_id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) AS nombre
  FROM auth.users
  WHERE id != auth.uid()
    AND (
      email ILIKE '%' || query_input || '%'
      OR (raw_user_meta_data->>'name') ILIKE '%' || query_input || '%'
    )
  ORDER BY
    CASE WHEN lower(email) LIKE lower(query_input) || '%' THEN 0 ELSE 1 END,
    email
  LIMIT 8;
$$;
