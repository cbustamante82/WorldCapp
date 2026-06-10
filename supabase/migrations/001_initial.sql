-- WorldCapp — Migración inicial
-- Ejecutar en Supabase Dashboard → SQL Editor

-- ── Tabla de progreso por usuario ────────────────────────────────────────────
create table public.progreso_usuario (
  user_id    uuid    not null references auth.users(id) on delete cascade,
  lamina_id  text    not null,
  pegada     boolean not null default false,
  repetidas  integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint progreso_usuario_pkey primary key (user_id, lamina_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.progreso_usuario enable row level security;

create policy "Usuarios gestionan su propio progreso"
  on public.progreso_usuario
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Habilitar Realtime ────────────────────────────────────────────────────────
-- También se puede activar en: Dashboard → Database → Replication → progreso_usuario
alter publication supabase_realtime add table public.progreso_usuario;

-- ── RPC: obtener pregunta secreta por email (sin requerir sesión) ─────────────
create or replace function public.get_pregunta_secreta(p_email text)
returns text
language sql
security definer
set search_path = auth, public
as $$
  select raw_user_meta_data->>'preguntaSecreta'
  from auth.users
  where email = lower(p_email)
  limit 1;
$$;

-- ── RPC: verificar respuesta secreta por email + hash SHA-256 ─────────────────
create or replace function public.verify_secret_answer(p_email text, p_answer_hash text)
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists(
    select 1 from auth.users
    where email = lower(p_email)
      and raw_user_meta_data->>'respuestaHash' = p_answer_hash
  );
$$;
