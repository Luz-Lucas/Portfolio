-- Portfólio 3D: conteúdo editável e curadoria de projetos.
-- Escrita somente pelo servidor (service role) após requireAdmin(); leitura pública.

create table if not exists public.content (
  key text primary key check (key in ('readme', 'about', 'contact', 'skills', 'experience', 'cv')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.content is 'Seções editáveis do portfólio (uma linha por seção). Chave ausente = conteúdo de exemplo do código.';

create table if not exists public.projects (
  repo_id bigint primary key,
  visible boolean not null default false,
  sort int not null default 0,
  description text,
  demo_url text,
  cover_url text,
  updated_at timestamptz not null default now()
);

comment on table public.projects is 'Curadoria dos repositórios do GitHub exibidos no portfólio.';

alter table public.content enable row level security;
alter table public.projects enable row level security;

drop policy if exists "content é público" on public.content;
create policy "content é público" on public.content for select to anon, authenticated using (true);

drop policy if exists "projects é público" on public.projects;
create policy "projects é público" on public.projects for select to anon, authenticated using (true);

-- Sem policies de escrita: inserts/updates usam a service role no servidor.

insert into storage.buckets (id, name, public)
values ('cv', 'cv', true), ('images', 'images', true)
on conflict (id) do nothing;
