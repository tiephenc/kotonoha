-- KOTONOHA · comptes et synchronisation de la progression (Supabase, offre gratuite)
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.

-- 1. Une ligne par utilisateur : la progression complète (JSON), rien d'autre.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint progress_taille check (pg_column_size(data) < 5000000)
);

-- 2. Sécurité au niveau des lignes : chacun ne voit et ne modifie que sa propre progression.
alter table public.progress enable row level security;

drop policy if exists "lire sa progression" on public.progress;
drop policy if exists "créer sa progression" on public.progress;
drop policy if exists "modifier sa progression" on public.progress;
drop policy if exists "supprimer sa progression" on public.progress;

create policy "lire sa progression" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "créer sa progression" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "modifier sa progression" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "supprimer sa progression" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 3. Suppression de compte par l'utilisateur lui-même (droit à l'effacement).
--    La progression est effacée en cascade.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
