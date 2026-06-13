-- Política adicional en public.progreso_usuario para intercambios aprobados.
-- Permite leer el progreso de otro usuario cuando existe un intercambio aprobado
-- entre ambos. Supabase aplica OR entre políticas del mismo evento (SELECT),
-- por lo que esta convive con la política existente de acceso propio.

CREATE POLICY "progreso_en_intercambio_aprobado" ON public.progreso_usuario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.intercambios
      WHERE estado = 'aprobado'
        AND (
          (solicitante_id = auth.uid() AND receptor_id = progreso_usuario.user_id)
          OR
          (receptor_id   = auth.uid() AND solicitante_id = progreso_usuario.user_id)
        )
    )
  );
