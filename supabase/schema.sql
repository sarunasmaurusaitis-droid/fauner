-- Fauner duomenų bazė (Supabase / PostgreSQL)
-- Failą galima paleisti kelis kartus: jis sukuria trūkstamas lenteles ir atnaujina senesnę versiją.
-- Supabase → SQL Editor → įklijuoti VISĄ failą → Run

-- ======================= LENTELĖS =======================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'user',
  city text default '',
  shelter_name text default '',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.profiles add column if not exists onboarded boolean not null default false;
alter table public.profiles add column if not exists avatar_url text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists website text not null default '';
alter table public.profiles add column if not exists address text not null default '';
alter table public.profiles add column if not exists about text not null default '';
alter table public.profiles drop column if exists email;
alter table public.profiles drop column if exists adult;

-- Rolės: user (ieško ir kelia skelbimus), shelter (patvirtinta prieglauda), admin
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'user' where role in ('seeker', 'owner');
update public.profiles set role = 'admin' where role = 'moderator';
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'shelter', 'admin'));
alter table public.profiles alter column role set default 'user';

-- Privatūs duomenys (gimimo data) – mato tik pats vartotojas ir administratorius
create table if not exists public.profile_private (
  id uuid primary key references public.profiles(id) on delete cascade,
  birth_date date not null
);

create table if not exists public.pets (
  id bigint generated always as identity primary key,
  owner_id uuid references public.profiles(id) on delete cascade,
  org_name text default '',
  name text not null,
  species text not null,
  city text not null default '',
  description text default '',
  traits text[] not null default '{}',
  health text[] not null default '{}',
  photos text[] not null default '{}',
  status text not null default 'Laukia namų',
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pets add column if not exists breed text not null default '';
alter table public.pets add column if not exists mixed boolean not null default false;
alter table public.pets add column if not exists birth_date date;
alter table public.pets add column if not exists sex text not null default 'Patinas';
alter table public.pets add column if not exists queue_open boolean not null default true;
alter table public.pets add column if not exists archived boolean not null default false;
alter table public.pets add column if not exists review_status text not null default 'ok';
alter table public.pets add column if not exists review_reason text not null default '';
-- Senas amžius metais → apytikslė gimimo data
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'pets' and column_name = 'age_years') then
    update public.pets set birth_date = (created_at - make_interval(months => round(age_years * 12)::int))::date where birth_date is null;
    alter table public.pets drop column age_years;
  end if;
end $$;
update public.pets set birth_date = current_date - 365 where birth_date is null;
alter table public.pets alter column birth_date set not null;
alter table public.pets drop column if exists size;
update public.pets set species = 'Graužikas' where species = 'Kita';
update public.pets set health = array_replace(health, 'Kastruotas', 'Kastruotas / sterilizuotas');
update public.pets set breed = case name
  when 'Rudis' then 'Biglis' when 'Mila' then 'Europinė trumpaplaukė' when 'Kiwi' then 'Velso korgis'
  when 'Murka' then 'Europinė trumpaplaukė' when 'Juodis' then 'Džeko Raselo terjeras' when 'Bella' then 'Australų aviganis'
  when 'Mėta' then 'Europinė trumpaplaukė' when 'Maksas' then 'Dalmatinas' when 'Pūkis' then 'Liūtagalvis'
  when 'Garfas' then 'Europinė trumpaplaukė' when 'Auksė' then 'Auksaspalvis retriveris' else 'Nežinoma (mišrūnas)' end
  where breed = '';
alter table public.pets drop constraint if exists pets_species_check;
alter table public.pets add constraint pets_species_check check (species in ('Šuo', 'Katė', 'Triušis', 'Graužikas', 'Paukštis', 'Šeškas', 'Roplys', 'Žuvys'));
alter table public.pets drop constraint if exists pets_sex_check;
alter table public.pets add constraint pets_sex_check check (sex in ('Patinas', 'Patelė'));
alter table public.pets drop constraint if exists pets_status_check;
alter table public.pets add constraint pets_status_check check (status in ('Laukia namų', 'Rezervuotas', 'Rado namus'));
alter table public.pets drop constraint if exists pets_review_check;
alter table public.pets add constraint pets_review_check check (review_status in ('ok', 'pending', 'rejected'));
-- Privalomi laukai tikrinami ir duomenų bazėje (jų negalima apeiti per naršyklę)
alter table public.pets drop constraint if exists pets_required_check;
alter table public.pets add constraint pets_required_check check (
  length(trim(name)) between 1 and 40 and length(trim(breed)) > 0 and length(trim(city)) > 0
  and length(trim(coalesce(description, ''))) >= 20 and cardinality(photos) between 1 and 5 and birth_date <= current_date) not valid;

create table if not exists public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  pet_id bigint references public.pets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, pet_id)
);

create table if not exists public.requests (
  id bigint generated always as identity primary key,
  pet_id bigint not null references public.pets(id) on delete cascade,
  seeker_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text default '',
  city text default '',
  housing text default '',
  has_pets boolean default false,
  motivation text default '',
  status text not null default 'Išsiųsta',
  created_at timestamptz not null default now()
);
alter table public.requests add column if not exists queued boolean not null default false;
alter table public.requests add column if not exists seeker_read_at timestamptz not null default now();
alter table public.requests add column if not exists owner_read_at timestamptz not null default 'epoch';
alter table public.requests drop constraint if exists requests_status_check;
alter table public.requests add constraint requests_status_check
  check (status in ('Išsiųsta', 'Peržiūrėta', 'Pakviestas susitikti', 'Pasirinktas', 'Atmesta', 'Atšaukta'));

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  request_id bigint not null references public.requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.messages add column if not exists kind text not null default 'text';

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  pet_id bigint not null references public.pets(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text default '',
  status text not null default 'Nauja' check (status in ('Nauja', 'Atmesta', 'Pašalinta')),
  created_at timestamptz not null default now()
);

create table if not exists public.shelter_applications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_name text not null,
  legal_form text not null default 'Juridinis asmuo',
  company_code text default '',
  vmvt_ref text default '',
  address text default '',
  city text default '',
  contact_person text default '',
  phone text default '',
  email text default '',
  website text default '',
  about text default '',
  docs text[] not null default '{}',
  status text not null default 'Laukia' check (status in ('Laukia', 'Patvirtinta', 'Atmesta')),
  admin_note text default '',
  created_at timestamptz not null default now()
);

-- ======================= FUNKCIJOS =======================

drop function if exists public.is_moderator() cascade;
drop function if exists public.check_pet() cascade;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and not banned);
$$;

-- Aktyvus vartotojas: neužblokuotas ir patvirtinęs, kad jam 18+
create or replace function public.is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and not banned and onboarded);
$$;

create or replace function public.owns_pet(p bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pets where id = p and owner_id = auth.uid());
$$;

create or replace function public.in_request(r bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from requests q join pets p on p.id = q.pet_id
    where q.id = r and (q.seeker_id = auth.uid() or p.owner_id = auth.uid())
  );
$$;

-- Registracija: profilis sukuriamas automatiškai. Jaunesni nei 18 m. neįleidžiami.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare bd date := nullif(new.raw_user_meta_data->>'birth_date', '')::date;
begin
  if bd is not null and bd > (current_date - interval '18 years') then
    raise exception 'Fauner gali naudotis tik pilnamečiai (nuo 18 metų)';
  end if;
  insert into profiles (id, name, role, city, avatar_url, onboarded)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''), 'user',
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    bd is not null);
  if bd is not null then insert into profile_private (id, birth_date) values (new.id, bd); end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prisijungus per Google / Facebook (arba senai paskyrai) – gimimo data ir miestas
create or replace function public.complete_profile(p_birth date, p_city text, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Reikia prisijungti'; end if;
  if p_birth is null or p_birth > (current_date - interval '18 years') then
    raise exception 'Fauner gali naudotis tik pilnamečiai (nuo 18 metų)';
  end if;
  insert into profile_private (id, birth_date) values (auth.uid(), p_birth)
    on conflict (id) do update set birth_date = excluded.birth_date;
  perform set_config('fauner.system', '1', true);
  update profiles set onboarded = true, city = coalesce(nullif(p_city, ''), city), name = coalesce(nullif(p_name, ''), name) where id = auth.uid();
end $$;

-- Rolės, patvirtinimo, blokavimo ir 18+ žymos vartotojas pats keisti negali
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() tuščias = komanda iš Supabase SQL Editor (administratorius), ją leidžiam
  if auth.uid() is not null and not public.is_admin() and coalesce(current_setting('fauner.system', true), '') <> '1' then
    new.verified := old.verified;
    new.role := old.role;
    new.banned := old.banned;
    new.onboarded := old.onboarded;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before update on public.profiles
  for each row execute function public.protect_profile();

-- „Ne pardavimui“: įtartini žodžiai → skelbimas laukia administratoriaus patikrinimo (niekam nerodomas)
create or replace function public.sale_words(t text) returns text
language sql immutable as $$
  select string_agg(distinct m[1], ', ') from regexp_matches(lower(coalesce(t, '')),
    '(kain[[:alpha:]]*|parduod[[:alpha:]]*|pardav[[:alpha:]]*|mokest[[:alpha:]]*|atlyg[[:alpha:]]*|užstat[[:alpha:]]*|apmokė[[:alpha:]]*|sumokė[[:alpha:]]*|pinig[[:alpha:]]*|kompensac[[:alpha:]]*|€|\m(?:eur|eurų|eurai|euro|perku)\M)', 'g') as m;
$$;

create or replace function public.protect_pet() returns trigger
language plpgsql security definer set search_path = public as $$
declare w text; priv boolean := auth.uid() is null or public.is_admin();
begin
  if tg_op = 'UPDATE' then
    if not priv then
      new.hidden := old.hidden;
      new.owner_id := old.owner_id;
      new.review_status := old.review_status;
      new.review_reason := old.review_reason;
    end if;
    new.updated_at := now();
  elsif auth.uid() is not null and not priv then
    new.review_status := 'ok'; new.review_reason := ''; new.hidden := false;
  end if;
  if not priv and (tg_op = 'INSERT' or new.name is distinct from old.name or new.description is distinct from old.description) then
    w := public.sale_words(new.name || ' ' || coalesce(new.description, ''));
    if w is not null then
      new.review_status := 'pending';
      new.review_reason := 'Rasti žodžiai: ' || w;
    elsif new.review_status = 'pending' and new.review_reason like 'Rasti žodžiai:%' then
      new.review_status := 'ok'; new.review_reason := '';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_pet on public.pets;
create trigger protect_pet before insert or update on public.pets
  for each row execute function public.protect_pet();

-- Ieškotojas užklausoje gali tik ją atšaukti ir pažymėti perskaitytą
create or replace function public.protect_request() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.owns_pet(old.pet_id) and not public.is_admin() then
    if new.status <> 'Atšaukta' then new.status := old.status; end if;
    new.owner_read_at := old.owner_read_at;
  end if;
  return new;
end $$;
drop trigger if exists protect_request on public.requests;
create trigger protect_request before update on public.requests
  for each row execute function public.protect_request();

-- Adminas patvirtina paraišką → vartotojas tampa patvirtinta prieglauda
create or replace function public.approve_application(app_id bigint, approve boolean, note text default '')
returns void language plpgsql security definer set search_path = public as $$
declare a shelter_applications;
begin
  if not public.is_admin() then raise exception 'Tik administratorius'; end if;
  select * into a from shelter_applications where id = app_id;
  update shelter_applications set status = case when approve then 'Patvirtinta' else 'Atmesta' end, admin_note = coalesce(note, '') where id = app_id;
  if approve then
    update profiles set role = case when role = 'admin' then 'admin' else 'shelter' end, verified = true,
      shelter_name = a.org_name, city = coalesce(nullif(a.city, ''), city), phone = coalesce(a.phone, ''),
      website = coalesce(a.website, ''), address = coalesce(a.address, ''), about = coalesce(a.about, '')
    where id = a.user_id;
  end if;
end $$;

-- Paskyros ištrynimas: savo arba (adminui) bet kurio vartotojo
create or replace function public.delete_user(uid uuid default null)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if uid is null or uid = auth.uid() then
    delete from auth.users where id = auth.uid();
  elsif public.is_admin() then
    delete from auth.users where id = uid;
  else
    raise exception 'Neturite teisės';
  end if;
end $$;

-- Adminui: vartotojų sąrašas su el. paštais (kitiems el. paštai nematomi)
drop function if exists public.admin_users();
create or replace function public.admin_users()
returns table (id uuid, email text, name text, role text, city text, shelter_name text, verified boolean, banned boolean,
  onboarded boolean, created_at timestamptz, last_sign_in_at timestamptz, pet_count bigint)
language plpgsql stable security definer set search_path = public, auth as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Tik administratorius'; end if;
  return query select p.id, u.email::text, p.name, p.role, p.city, p.shelter_name, p.verified, p.banned, p.onboarded,
    p.created_at, u.last_sign_in_at, (select count(*) from pets x where x.owner_id = p.id)
    from profiles p join auth.users u on u.id = p.id order by p.created_at desc;
end $$;

-- ======================= TEISĖS (Row Level Security) =======================

alter table public.profiles  enable row level security;
alter table public.profile_private enable row level security;
alter table public.pets      enable row level security;
alter table public.favorites enable row level security;
alter table public.requests  enable row level security;
alter table public.messages  enable row level security;
alter table public.reports   enable row level security;
alter table public.shelter_applications enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in
    ('profiles', 'profile_private', 'pets', 'favorites', 'requests', 'messages', 'reports', 'shelter_applications') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles update" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "private read"    on public.profile_private for select using (id = auth.uid() or public.is_admin());

create policy "pets read"   on public.pets for select using
  ((not hidden and not archived and owner_id is not null and review_status = 'ok') or owner_id = auth.uid() or public.is_admin());
create policy "pets insert" on public.pets for insert with check (owner_id = auth.uid() and public.is_active());
create policy "pets update" on public.pets for update using ((owner_id = auth.uid() and public.is_active()) or public.is_admin());
create policy "pets delete" on public.pets for delete using (owner_id = auth.uid() or public.is_admin());

create policy "favorites own" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "requests read"   on public.requests for select using (seeker_id = auth.uid() or public.owns_pet(pet_id));
create policy "requests insert" on public.requests for insert with check (seeker_id = auth.uid() and public.is_active());
create policy "requests update" on public.requests for update using (seeker_id = auth.uid() or public.owns_pet(pet_id));

create policy "messages read"   on public.messages for select using (public.in_request(request_id));
create policy "messages insert" on public.messages for insert with check (sender_id = auth.uid() and public.in_request(request_id) and public.is_active());

create policy "reports insert" on public.reports for insert with check (auth.uid() is not null and public.is_active());
create policy "reports read"   on public.reports for select using (public.is_admin());
create policy "reports update" on public.reports for update using (public.is_admin());
create policy "reports delete" on public.reports for delete using (public.is_admin());

create policy "apps insert" on public.shelter_applications for insert with check (user_id = auth.uid() and public.is_active());
create policy "apps read"   on public.shelter_applications for select using (user_id = auth.uid() or public.is_admin());
create policy "apps update" on public.shelter_applications for update using (public.is_admin());

-- ======================= FAILAI (Storage) =======================

insert into storage.buckets (id, name, public) values ('pet-photos', 'pet-photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('shelter-docs', 'shelter-docs', false) on conflict (id) do nothing;

drop policy if exists "photos read"    on storage.objects;
drop policy if exists "photos upload"  on storage.objects;
drop policy if exists "avatars read"   on storage.objects;
drop policy if exists "avatars upload" on storage.objects;
drop policy if exists "docs upload"    on storage.objects;
drop policy if exists "docs read"      on storage.objects;
create policy "photos read"    on storage.objects for select using (bucket_id = 'pet-photos');
create policy "photos upload"  on storage.objects for insert with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars read"   on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars upload" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs upload"    on storage.objects for insert with check (bucket_id = 'shelter-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs read"      on storage.objects for select using (bucket_id = 'shelter-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ======================= PRADINIAI DUOMENYS (tik tuščiai bazei) =======================
-- Pradiniai gyvūnai neturi savininko, todėl nerodomi, kol administratorius jų nepriskiria prieglaudai.

insert into public.pets (org_name, name, species, breed, mixed, birth_date, sex, city, description, traits, health, photos, status)
select * from (values
  ('VšĮ „Letenėlė“','Rudis','Šuo','Biglis',false,current_date - 1460,'Patinas','Klaipėda','Rudis – ramus ir labai meilus šuo. Prieglaudoje gyvena aštuonis mėnesius. Mėgsta ilgus pasivaikščiojimus, gerai sutaria su vaikais ir kitais šunimis. Tinka ir butui, jei kasdien bus bent valanda lauke.', array['Ramus','Draugiškas vaikams','Tinka butui','Sutaria su kitais'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], array['https://images.unsplash.com/photo-1774440865389-194cf5acba8c?w=900&q=80','https://images.unsplash.com/photo-1774440865384-f26022125340?w=900&q=80'], 'Laukia namų'),
  ('Gyvūnų globa Vilniuje','Mila','Katė','Europinė trumpaplaukė',false,current_date - 365,'Patelė','Vilnius','Mila – smalsi ir žaisminga katytė. Mėgsta sėdėti ant palangės ir stebėti paukščius.', array['Aktyvus','Tinka butui'], array['Paskiepytas','Čipuotas'], array['https://images.unsplash.com/photo-1625060241508-22488e1e9264?w=900&q=80','https://images.unsplash.com/photo-1625060299486-4c08fe81cdf5?w=900&q=80'], 'Rezervuotas'),
  ('Gyvūnų globa Vilniuje','Kiwi','Šuo','Velso korgis',false,current_date - 300,'Patinas','Vilnius','Kiwi – energingas šuniukas, kuriam reikia aktyvios šeimos ir daug žaidimų.', array['Aktyvus','Draugiškas vaikams'], array['Paskiepytas'], array['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=900&q=80','https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=900&q=80'], 'Laukia namų'),
  ('Kauno gyvūnų prieglauda','Murka','Katė','Europinė trumpaplaukė',false,current_date - 1095,'Patelė','Kaunas','Murka – rami katė, mėgstanti glaustis. Tinka žmonėms, kurie daug laiko praleidžia namuose.', array['Ramus','Tinka butui'], array['Paskiepytas','Kastruotas / sterilizuotas'], array['https://images.unsplash.com/photo-1547468137-1ad02f558bec?w=900&q=80','https://images.unsplash.com/photo-1487160342031-439ea29c3c7b?w=900&q=80'], 'Laukia namų'),
  ('Kauno gyvūnų prieglauda','Juodis','Šuo','Džeko Raselo terjeras',false,current_date - 730,'Patinas','Kaunas','Juodis – linksmas ir protingas šuo, greitai mokosi komandų.', array['Aktyvus','Sutaria su kitais'], array['Paskiepytas','Čipuotas'], array['https://images.unsplash.com/photo-1599908758973-b02eb044e5ab?w=900&q=80','https://images.unsplash.com/photo-1599908758979-25ba52737fb5?w=900&q=80'], 'Laukia namų'),
  ('VšĮ „Letenėlė“','Bella','Šuo','Australų aviganis',true,current_date - 1095,'Patelė','Palanga','Bella – švelni ir draugiška kalytė, mėgsta vaikus ir pasivaikščiojimus prie jūros.', array['Draugiškas vaikams','Sutaria su kitais'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], array['https://images.unsplash.com/photo-1627961314781-efd6a0360260?w=900&q=80','https://images.unsplash.com/photo-1628884978036-35035df5968b?w=900&q=80'], 'Laukia namų'),
  ('Gyvūnų globa Vilniuje','Mėta','Katė','Europinė trumpaplaukė',false,current_date - 730,'Patelė','Vilnius','Mėta – drąsi katytė, kuri greitai pripranta prie naujų namų.', array['Aktyvus','Tinka butui'], array['Paskiepytas'], array['https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=900&q=80','https://images.unsplash.com/photo-1471874276752-65e2d717604a?w=900&q=80'], 'Rezervuotas'),
  ('Šiaulių gyvūnų draugai','Maksas','Šuo','Dalmatinas',true,current_date - 1825,'Patinas','Šiauliai','Maksas – ištikimas didelis šuo, tinkamas namui su kiemu.', array['Ramus','Sutaria su kitais'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], array['https://images.unsplash.com/photo-1626435872652-674a80247929?w=900&q=80','https://images.unsplash.com/photo-1626435872665-2e39a0614b4e?w=900&q=80'], 'Laukia namų'),
  ('Gyvūnų globa Vilniuje','Pūkis','Triušis','Liūtagalvis',false,current_date - 365,'Patinas','Vilnius','Pūkis – ramus triušis, pratęs prie žmonių rankų.', array['Ramus','Tinka butui'], array[]::text[], array['https://images.unsplash.com/photo-1759687083629-d64eeacdb5f8?w=900&q=80','https://images.unsplash.com/photo-1759687084201-ef8e95b17796?w=900&q=80'], 'Laukia namų'),
  ('Kauno gyvūnų prieglauda','Garfas','Katė','Europinė trumpaplaukė',false,current_date - 2190,'Patinas','Kaunas','Garfas – ramus katinas, mėgsta miegoti saulėje.', array['Ramus'], array['Paskiepytas','Kastruotas / sterilizuotas'], array['https://images.unsplash.com/photo-1769922927973-7a530f3752df?w=900&q=80','https://images.unsplash.com/photo-1769922928084-08b00a5f92e0?w=900&q=80'], 'Laukia namų')
) as v(org_name, name, species, breed, mixed, birth_date, sex, city, description, traits, health, photos, status)
where not exists (select 1 from public.pets);
