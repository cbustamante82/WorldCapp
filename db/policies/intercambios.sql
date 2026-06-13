-- Políticas RLS para la tabla public.intercambios.
-- Requiere: tabla intercambios creada (db/tables/intercambios.sql).

-- El usuario puede ver sus propios intercambios (enviados o recibidos)
CREATE POLICY "intercambios_select" ON public.intercambios
  FOR SELECT USING (
    auth.uid() = solicitante_id OR auth.uid() = receptor_id
  );

-- Solo el solicitante puede crear la solicitud
CREATE POLICY "intercambios_insert" ON public.intercambios
  FOR INSERT WITH CHECK (auth.uid() = solicitante_id);

-- Solo el receptor puede aprobar o rechazar
CREATE POLICY "intercambios_update" ON public.intercambios
  FOR UPDATE USING (auth.uid() = receptor_id)
  WITH CHECK (estado IN ('aprobado', 'rechazado'));
