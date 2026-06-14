-- Confirma el lado del usuario autenticado en un intercambio aprobado.
-- Solo modifica las láminas del usuario que llama, nunca las del otro.
-- Si ambos ya confirmaron, transiciona el estado a 'completado'.
-- SECURITY DEFINER: accede a public.intercambios sin exponer tablas internas.

CREATE OR REPLACE FUNCTION public.confirmar_intercambio(
  intercambio_id      UUID,
  laminas_confirmadas integer[]
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ix      public.intercambios%ROWTYPE;
  soy_sol BOOLEAN;
BEGIN
  SELECT * INTO ix FROM public.intercambios WHERE id = intercambio_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intercambio no encontrado';
  END IF;

  IF ix.estado = 'completado' THEN
    RETURN;
  END IF;

  IF ix.estado <> 'aprobado' THEN
    RAISE EXCEPTION 'Solo se puede confirmar un intercambio aprobado';
  END IF;

  IF ix.solicitante_id <> auth.uid() AND ix.receptor_id <> auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  soy_sol := ix.solicitante_id = auth.uid();

  SELECT * INTO ix FROM public.intercambios WHERE id = intercambio_id FOR UPDATE;

  IF soy_sol THEN
    UPDATE public.intercambios SET
      laminas_solicitante    = laminas_confirmadas,
      confirmado_solicitante = TRUE,
      estado     = CASE WHEN ix.confirmado_receptor THEN 'completado' ELSE estado END,
      updated_at = NOW()
    WHERE id = intercambio_id;
  ELSE
    UPDATE public.intercambios SET
      laminas_receptor    = laminas_confirmadas,
      confirmado_receptor = TRUE,
      estado     = CASE WHEN ix.confirmado_solicitante THEN 'completado' ELSE estado END,
      updated_at = NOW()
    WHERE id = intercambio_id;
  END IF;
END;
$$;
