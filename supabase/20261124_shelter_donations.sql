-- Fauner: saugus prieglaudų paramos rekvizitų patvirtinimas
-- Vykdyti tik norimoje Supabase aplinkoje. Šis failas nekeičia esamos schema.sql.
create table if not exists public.shelter_donation_requests (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null unique references public.profiles(id) on delete cascade,
  account_holder text not null check (length(trim(account_holder)) between 2 and 120),
  bank_name text not null check (length(trim(bank_name)) between 2 and 80),
  iban text not null check (iban = upper(regexp_replace(iban, '\s', '', 'g')) and iban ~ '^[A-Z]{2}[0-9A-Z]{13,32}$'),
  instructions text not null default '' check (length(instructions) <= 1000),
  status text not null default 'Laukia' check (status in ('Laukia', 'Patvirtinta', 'Atmesta')),
  admin_note text not null default '', created_at timestamptz not null default now(), reviewed_at timestamptz
);
alter table public.shelter_donation_requests enable row level security;
revoke all on table public.shelter_donation_requests from anon, authenticated;
grant select on table public.shelter_donation_requests to anon, authenticated;
drop policy if exists "donations visible when approved or owned" on public.shelter_donation_requests;
create policy "donations visible when approved or owned" on public.shelter_donation_requests for select
  using (shelter_id = auth.uid() or public.is_admin() or status = 'Patvirtinta');

create or replace function public.submit_shelter_donation_request(
  p_account_holder text, p_bank_name text, p_iban text, p_instructions text default ''
) returns uuid language plpgsql security definer set search_path = public as $$
declare result_id uuid;
begin
  if not public.is_active() then raise exception 'Reikia aktyvios paskyros'; end if;
  if not exists (select 1 from profiles where id = auth.uid() and role = 'shelter' and verified and not banned) then
    raise exception 'Paramą gali gauti tik patvirtinta prieglauda';
  end if;
  insert into shelter_donation_requests (shelter_id, account_holder, bank_name, iban, instructions)
  values (auth.uid(), trim(p_account_holder), trim(p_bank_name), upper(regexp_replace(p_iban, '\s', '', 'g')), coalesce(p_instructions, ''))
  on conflict (shelter_id) do update set account_holder = excluded.account_holder, bank_name = excluded.bank_name,
    iban = excluded.iban, instructions = excluded.instructions, status = 'Laukia', admin_note = '', created_at = now(), reviewed_at = null
  where shelter_donation_requests.status = 'Atmesta' returning id into result_id;
  if result_id is null then raise exception 'Paramos prašymas jau pateiktas arba patvirtintas'; end if;
  return result_id;
end $$;

create or replace function public.review_shelter_donation_request(
  p_request_id uuid, p_approve boolean, p_note text default ''
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Tik administratorius'; end if;
  update shelter_donation_requests set status = case when p_approve then 'Patvirtinta' else 'Atmesta' end,
    admin_note = coalesce(p_note, ''), reviewed_at = now() where id = p_request_id and status = 'Laukia';
  if not found then raise exception 'Prašymas nerastas arba jau peržiūrėtas'; end if;
end $$;
revoke all on function public.submit_shelter_donation_request(text,text,text,text) from public;
grant execute on function public.submit_shelter_donation_request(text,text,text,text) to authenticated;
revoke all on function public.review_shelter_donation_request(uuid,boolean,text) from public;
grant execute on function public.review_shelter_donation_request(uuid,boolean,text) to authenticated;
comment on table public.shelter_donation_requests is 'Prieglaudų paramos gavimo rekvizitai; viešai matomi tik Patvirtinta būsenos įrašai.';
