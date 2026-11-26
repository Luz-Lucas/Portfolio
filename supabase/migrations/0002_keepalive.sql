-- Heartbeat do keepalive: /api/keepalive grava aqui (service role) para gerar atividade real no banco
-- e o Supabase gratuito não pausar o projeto por inatividade.

create table if not exists public.keepalive (
  id smallint primary key default 1 check (id = 1),
  pinged_at timestamptz not null default now(),
  source text
);

comment on table public.keepalive is 'Uma linha, atualizada pelo /api/keepalive (Vercel Cron e GitHub Actions).';

-- RLS sem policies: só a service role (servidor) lê e escreve.
alter table public.keepalive enable row level security;

insert into public.keepalive (id) values (1) on conflict (id) do nothing;
