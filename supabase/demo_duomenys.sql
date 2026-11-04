-- 1) Pradinių gyvūnų nuotraukos: po 2 to paties gyvūno nuotraukas
update pets set photos = array['https://images.unsplash.com/photo-1774440865389-194cf5acba8c?w=900&q=80','https://images.unsplash.com/photo-1774440865384-f26022125340?w=900&q=80'] where name = 'Rudis' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1625060241508-22488e1e9264?w=900&q=80','https://images.unsplash.com/photo-1625060299486-4c08fe81cdf5?w=900&q=80'] where name = 'Mila' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=900&q=80','https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=900&q=80'] where name = 'Kiwi' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1547468137-1ad02f558bec?w=900&q=80','https://images.unsplash.com/photo-1487160342031-439ea29c3c7b?w=900&q=80'] where name = 'Murka' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1599908758973-b02eb044e5ab?w=900&q=80','https://images.unsplash.com/photo-1599908758979-25ba52737fb5?w=900&q=80'] where name = 'Juodis' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1627961314781-efd6a0360260?w=900&q=80','https://images.unsplash.com/photo-1628884978036-35035df5968b?w=900&q=80'] where name = 'Bella' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=900&q=80','https://images.unsplash.com/photo-1471874276752-65e2d717604a?w=900&q=80'] where name = 'Mėta' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1626435872652-674a80247929?w=900&q=80','https://images.unsplash.com/photo-1626435872665-2e39a0614b4e?w=900&q=80'] where name = 'Maksas' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1759687083629-d64eeacdb5f8?w=900&q=80','https://images.unsplash.com/photo-1759687084201-ef8e95b17796?w=900&q=80'] where name = 'Pūkis' and org_name <> '';
update pets set photos = array['https://images.unsplash.com/photo-1769922927973-7a530f3752df?w=900&q=80','https://images.unsplash.com/photo-1769922928084-08b00a5f92e0?w=900&q=80'] where name = 'Garfas' and org_name <> '';

-- 2) Demonstracinės paskyros (pirma sukurk jas Authentication → Users → Add user, „Auto Confirm User“)
-- Fauner: demonstracinės paskyros ir gyvūnų priskyrimas
-- Prieš paleidžiant: Supabase → Authentication → Users → Add user → Create new user
-- (pažymėti „Auto Confirm User“) su VISAIS žemiau nurodytais el. paštais.
do $$
declare r record; uid uuid;
begin
  for r in select * from (values
    -- el. paštas,                    vardas / pavadinimas,              miestas,     rolė,      gyvūnai
    ('letenele.demo@fauner.test',  'VšĮ „Letenėlė“ (demo)',           'Klaipėda', 'shelter', array['Rudis','Bella','Auksė']),
    ('vilnius.demo@fauner.test',   'Gyvūnų globa Vilniuje (demo)',    'Vilnius',  'shelter', array['Mila','Kiwi','Mėta']),
    ('ruta.demo@fauner.test',      'Rūta (demo)',                     'Kaunas',   'user',    array['Murka']),
    ('tomas.demo@fauner.test',     'Tomas (demo)',                    'Kaunas',   'user',    array['Juodis']),
    ('lina.demo@fauner.test',      'Lina (demo)',                     'Šiauliai', 'user',    array['Maksas']),
    ('paulius.demo@fauner.test',   'Paulius (demo)',                  'Kaunas',   'user',    array['Garfas']),
    ('egle.demo@fauner.test',      'Eglė (demo)',                     'Vilnius',  'user',    array['Pūkis']),
    ('ieskotojas.demo@fauner.test','Ieškotojas (demo)',               'Vilnius',  'user',    array[]::text[])
  ) as t(email, name, city, role, pets) loop
    select id into uid from auth.users where email = r.email;
    if uid is null then raise notice 'Nėra paskyros %, praleidžiu', r.email; continue; end if;
    update profiles set name = r.name, city = r.city, role = r.role, onboarded = true,
      verified = (r.role = 'shelter'), shelter_name = case when r.role = 'shelter' then r.name else '' end,
      about = case when r.role = 'shelter' then 'Demonstracinė prieglauda testavimui – tai ne tikra organizacija.' else '' end
    where id = uid;
    update pets set owner_id = uid, city = r.city where name = any(r.pets) and org_name <> '' and owner_id is null;
  end loop;
end $$;

-- Patikrinimas: kiekvienas gyvūnas turi savininką
select p.name as gyvunas, coalesce(nullif(o.shelter_name, ''), o.name, '— NĖRA —') as savininkas
from pets p left join profiles o on o.id = p.owner_id order by 2;
