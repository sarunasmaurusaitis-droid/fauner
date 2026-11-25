-- Fauner W13: išvaizdos laukai, esamų gyvūnų užpildymas ir nauji gyvūnai
-- Paleisti vieną kartą: Supabase → SQL Editor → įklijuoti visą failą → Run.
-- Galima paleisti ir pakartotinai: stulpeliai kuriami tik jei jų nėra, nauji gyvūnai įterpiami tik jei tokio vardo dar nėra.

-- 1) Trūkstami stulpeliai (be jų svetainė negali išsaugoti skelbimų)
alter table public.pets add column if not exists eye_color text[] not null default '{}';
alter table public.pets add column if not exists fur_color text[] not null default '{}';
alter table public.pets add column if not exists height    text[] not null default '{}';  -- rodoma kaip „Dydis“
alter table public.pets add column if not exists fur_type  text[] not null default '{}';
alter table public.pets add column if not exists ear_type  text[] not null default '{}';

-- 2) Esamų šunų ir kačių išvaizda
update public.pets set eye_color = v.e, fur_color = v.f, height = v.h, fur_type = v.t, ear_type = v.a
from (values
  ('Rudis',  array['Rudos'],  array['Ruda','Balta','Juoda'], array['Vidutinis (10–25 kg)'],        array['Trumpas'], array['Nulėpusios']),
  ('Kiwi',   array['Rudos'],  array['Ruda','Balta'],         array['Mažas (iki 10 kg)'],           array['Trumpas'], array['Stačios']),
  ('Auksė',  array['Rudos'],  array['Smėlinė'],              array['Didelis (daugiau nei 25 kg)'], array['Ilgas'],   array['Nulėpusios']),
  ('Juodis', array['Rudos'],  array['Juoda','Balta'],        array['Mažas (iki 10 kg)'],           array['Trumpas'], array['Nulėpusios']),
  ('Bella',  array['Mėlynos'],array['Šviesiai pilka','Balta'],array['Vidutinis (10–25 kg)'],       array['Ilgas'],   array['Nulėpusios']),
  ('Maksas', array['Rudos'],  array['Balta','Juoda'],        array['Didelis (daugiau nei 25 kg)'], array['Trumpas'], array['Nulėpusios']),
  ('Mila',   array['Žalios'], array['Šviesiai pilka','Balta'],array['Mažas (iki 10 kg)'],          array['Trumpas'], array['Stačios']),
  ('Mėta',   array['Geltonos'],array['Tamsiai pilka'],       array['Mažas (iki 10 kg)'],           array['Trumpas'], array['Stačios']),
  ('Murka',  array['Žalios'], array['Juoda','Balta'],        array['Mažas (iki 10 kg)'],           array['Trumpas'], array['Stačios']),
  ('Garfas', array['Geltonos'],array['Ruda'],                array['Mažas (iki 10 kg)'],           array['Trumpas'], array['Stačios'])
) as v(name, e, f, h, t, a)
where pets.name = v.name and pets.species in ('Šuo', 'Katė');

-- 3) Nauji gyvūnai (savininkai – esamos demonstracinės paskyros, ne administratorius)
insert into public.pets (owner_id, name, species, breed, mixed, birth_date, sex, city, description, traits, health, photos, status,
                         eye_color, fur_color, height, fur_type, ear_type)
select pr.id, v.name, v.species, v.breed, v.mixed, current_date - v.days, v.sex, pr.city, v.descr, v.traits, v.health,
       array['https://images.unsplash.com/photo-' || v.photo || '?w=900&q=80'], 'Laukia namų', v.e, v.f, v.h, v.t, v.a
from (values
  ('VšĮ „Letenėlė“ (demo)', 'Bruno', 'Šuo', 'Biglis', false, 1100, 'Patinas',
   'Bruno – linksmas biglis, kuris visada pirmas pasitinka prie durų. Mėgsta uostinėti ir ilgus pasivaikščiojimus, su vaikais elgiasi švelniai.',
   array['Aktyvus','Draugiškas vaikams','Sutaria su kitais'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1543466835-00a7907e9de1',
   array['Rudos'], array['Ruda','Balta','Juoda'], array['Vidutinis (10–25 kg)'], array['Trumpas'], array['Nulėpusios']),
  ('Gyvūnų globa Vilniuje (demo)', 'Luna', 'Šuo', 'Labradoro retriveris', false, 120, 'Patelė',
   'Luna – smalsi šuniukė, kuri dar mokosi pasaulio. Jau žino komandą „sėdėk“ ir moka vaikščioti su pavadėliu. Ieškome šeimos, kuri turės laiko ją auklėti.',
   array['Aktyvus','Draugiškas vaikams'], array['Paskiepytas','Čipuotas'], '1586671267731-da2cf3ceeb80',
   array['Rudos'], array['Smėlinė'], array['Vidutinis (10–25 kg)'], array['Trumpas'], array['Nulėpusios']),
  ('Lina (demo)', 'Reksas', 'Šuo', 'Vokiečių aviganis', false, 400, 'Patinas',
   'Reksas – protingas jaunas aviganis. Greitai mokosi, mėgsta užduotis ir kamuoliuką. Labiau tiktų namui su kiemu.',
   array['Aktyvus','Sutaria su kitais'], array['Paskiepytas','Čipuotas','Pasas'], '1589941013453-ec89f33b5e95',
   array['Rudos'], array['Juoda','Ruda'], array['Didelis (daugiau nei 25 kg)'], array['Ilgas'], array['Stačios']),
  ('Rūta (demo)', 'Snieguolė', 'Šuo', 'Pomeranijos špicas', false, 730, 'Patelė',
   'Snieguolė – mažas baltas debesėlis. Rami, mėgsta glaustis ant kelių, puikiai jaučiasi bute.',
   array['Ramus','Tinka butui'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1626211596179-d1fe8beaf75c',
   array['Rudos'], array['Balta'], array['Mažas (iki 10 kg)'], array['Ilgas'], array['Stačios']),
  ('Tomas (demo)', 'Vilkas', 'Šuo', 'Sibiro haskis', false, 1460, 'Patinas',
   'Vilkas – energingas haskis, kuriam reikia daug judėjimo. Tiktų žmonėms, kurie bėgioja ar važinėja dviračiu.',
   array['Aktyvus','Sutaria su kitais'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1568572933382-74d440642117',
   array['Mėlynos'], array['Juoda','Balta','Šviesiai pilka'], array['Vidutinis (10–25 kg)'], array['Ilgas'], array['Stačios']),
  ('VšĮ „Letenėlė“ (demo)', 'Riešutas', 'Šuo', '', true, 800, 'Patinas',
   'Riešutas rastas prie kelio, dabar gyvena prieglaudoje. Draugiškas, nebijo žmonių, puikiai vaikšto su pavadėliu.',
   array['Draugiškas vaikams','Tinka butui'], array['Paskiepytas','Čipuotas'], '1657110605851-ebd3a5fcf650',
   array['Rudos'], array['Ruda','Smėlinė'], array['Vidutinis (10–25 kg)'], array['Trumpas'], array['Stačios']),
  ('Gyvūnų globa Vilniuje (demo)', 'Šešėlis', 'Šuo', 'Vokiečių aviganis', true, 1825, 'Patinas',
   'Šešėlis – aviganio mišrūnas. Ramus, ištikimas, mėgsta būti šalia žmogaus. Iš pradžių atsargus su nepažįstamais.',
   array['Ramus','Sutaria su kitais'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1610968755695-d7fcb5fd4b92',
   array['Rudos'], array['Juoda','Ruda'], array['Didelis (daugiau nei 25 kg)'], array['Ilgas'], array['Stačios']),
  ('Paulius (demo)', 'Taškė', 'Šuo', 'Borderkolis', false, 1100, 'Patelė',
   'Taškė – labai protinga ir aktyvi. Mėgsta mokytis triukų ir žaisti su lėkšte. Netinka ilgam vienai likti namuose.',
   array['Aktyvus','Draugiškas vaikams'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas','Pasas'], '1503256207526-0d5d80fa2f47',
   array['Rudos'], array['Juoda','Balta'], array['Vidutinis (10–25 kg)'], array['Ilgas'], array['Nulėpusios']),
  ('Eglė (demo)', 'Dešrelė', 'Šuo', 'Taksas', false, 2190, 'Patelė',
   'Dešrelė – rami vyresnė taksė. Mėgsta trumpus pasivaikščiojimus ir pagulėti saulėje. Tiks ramiai šeimai.',
   array['Ramus','Tinka butui'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1605638868237-0660a05a135b',
   array['Rudos'], array['Juoda','Ruda'], array['Mažas (iki 10 kg)'], array['Trumpas'], array['Nulėpusios']),
  ('Gyvūnų globa Vilniuje (demo)', 'Liūtas', 'Katė', 'Meino meškėnas', false, 1460, 'Patinas',
   'Liūtas – didelis, bet labai švelnus katinas. Mėgsta, kai jį šukuoja, ir visur seka paskui žmogų.',
   array['Ramus','Draugiškas vaikams'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1569591159212-b02ea8a9f239',
   array['Žalios'], array['Ruda','Smėlinė'], array['Vidutinis (10–25 kg)'], array['Ilgas'], array['Stačios']),
  ('VšĮ „Letenėlė“ (demo)', 'Naktis', 'Katė', '', true, 730, 'Patelė',
   'Naktis – juoda katytė su žaliomis akimis. Iš pradžių drovi, bet apsipratusi mėgsta murkti šalia.',
   array['Ramus','Tinka butui'], array['Paskiepytas','Kastruotas / sterilizuotas'], '1503431128871-cd250803fa41',
   array['Žalios'], array['Juoda'], array['Mažas (iki 10 kg)'], array['Trumpas'], array['Stačios']),
  ('Rūta (demo)', 'Morkus', 'Katė', 'Europinė trumpaplaukė', false, 365, 'Patinas',
   'Morkus – žaismingas rudas katinas. Mėgsta lakstyti paskui siūlų kamuoliuką ir sutaria su kitomis katėmis.',
   array['Aktyvus','Sutaria su katėmis'], array['Paskiepytas','Čipuotas'], '1596854407944-bf87f6fdd49e',
   array['Geltonos'], array['Ruda'], array['Mažas (iki 10 kg)'], array['Trumpas'], array['Stačios']),
  ('Lina (demo)', 'Tigrė', 'Katė', 'Europinė trumpaplaukė', false, 150, 'Patelė',
   'Tigrė – mažytė dryžuota katytė. Drąsi, smalsi ir jau moka naudotis kraiku.',
   array['Aktyvus','Tinka butui'], array['Paskiepytas'], '1574144611937-0df059b5ef3e',
   array['Geltonos'], array['Ruda','Tamsiai pilka'], array['Mažas (iki 10 kg)'], array['Trumpas'], array['Stačios']),
  ('Paulius (demo)', 'Pilkis', 'Katė', 'Britų trumpaplaukė', false, 1100, 'Patinas',
   'Pilkis – ramus britų katinas. Mėgsta tvarką, savo kampelį ir ramius vakarus.',
   array['Ramus','Tinka butui'], array['Paskiepytas','Kastruotas / sterilizuotas','Čipuotas'], '1629624467541-f73ef8f12df2',
   array['Geltonos'], array['Šviesiai pilka'], array['Mažas (iki 10 kg)'], array['Trumpas'], array['Stačios']),
  ('Eglė (demo)', 'Kakava', 'Graužikas', 'Jūrų kiaulytė', false, 365, 'Patelė',
   'Kakava – draugiška jūrų kiaulytė. Mėgsta morkas ir šviežią šieną. Atiduodame kartu su narvu.',
   array['Ramus'], array[]::text[], '1612267168669-679c961c5b31',
   array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[]),
  ('Tomas (demo)', 'Čiulbis', 'Paukštis', 'Banguotoji papūgėlė', false, 365, 'Patinas',
   'Čiulbis – linksma papūgėlė, kuri mėgsta švilpauti ryte. Pratusi prie žmonių balsų.',
   array['Aktyvus'], array[]::text[], '1560595643-90bb555b2eaa',
   array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[])
) as v(owner_name, name, species, breed, mixed, days, sex, descr, traits, health, photo, e, f, h, t, a)
join public.profiles pr on pr.name = v.owner_name
where not exists (select 1 from public.pets x where x.name = v.name and x.owner_id = pr.id);

-- 4) Patikrinimas: šunys ir katės be išvaizdos duomenų (turi būti tuščia)
select id, name, species from public.pets
where species in ('Šuo', 'Katė') and (eye_color = '{}' or fur_color = '{}' or height = '{}' or fur_type = '{}' or ear_type = '{}');
