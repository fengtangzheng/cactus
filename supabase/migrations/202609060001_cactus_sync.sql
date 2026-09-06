create table if not exists public.cactus_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null default 'main',
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table if not exists public.cactus_project_revisions (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.cactus_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  version bigint not null,
  document jsonb not null,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

alter table public.cactus_projects enable row level security;
alter table public.cactus_project_revisions enable row level security;

create policy "owners manage cactus projects"
  on public.cactus_projects
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners read cactus revisions"
  on public.cactus_project_revisions
  for select
  to authenticated
  using (owner_id = auth.uid());

create or replace function public.record_cactus_project_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cactus_project_revisions (project_id, owner_id, version, document)
  values (new.id, new.owner_id, new.version, new.document);
  return new;
end;
$$;

drop trigger if exists cactus_project_revision on public.cactus_projects;
create trigger cactus_project_revision
  after insert or update of document on public.cactus_projects
  for each row execute function public.record_cactus_project_revision();

create or replace function public.save_cactus_project(
  p_project_id uuid,
  p_expected_version bigint,
  p_document jsonb
)
returns table (id uuid, version bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
begin
  return query
    update public.cactus_projects as project
    set document = p_document,
        version = project.version + 1,
        updated_at = now()
    where project.id = p_project_id
      and project.owner_id = auth.uid()
      and project.version = p_expected_version
    returning project.id, project.version, project.updated_at;

  if not found then
    raise exception 'cactus_version_conflict' using errcode = '40001';
  end if;
end;
$$;

revoke all on function public.save_cactus_project(uuid, bigint, jsonb) from public;
grant execute on function public.save_cactus_project(uuid, bigint, jsonb) to authenticated;

insert into storage.buckets (id, name, public)
values ('cactus-private', 'cactus-private', false)
on conflict (id) do update set public = excluded.public;

create policy "owners upload cactus media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'cactus-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners read cactus media"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'cactus-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners update cactus media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'cactus-private' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cactus-private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners delete cactus media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cactus-private' and (storage.foldername(name))[1] = auth.uid()::text);
