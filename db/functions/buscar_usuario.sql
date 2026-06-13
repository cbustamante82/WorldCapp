-- Busca un usuario por email exacto (insensible a mayúsculas).
-- Excluye al usuario autenticado. Retorna máximo 1 resultado.
-- SECURITY DEFINER: accede a auth.users sin exponerlo al cliente.

CREATE OR REPLACE FUNCTION public.buscar_usuario(email_input TEXT)
RETURNS TABLE (user_id UUID, email TEXT, nombre TEXT)
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    id                                                                  AS user_id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) AS nombre
  FROM auth.users
  WHERE lower(email) = lower(email_input)
    AND id != auth.uid()
  LIMIT 1;
$$;
