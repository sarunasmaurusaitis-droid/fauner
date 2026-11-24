# Paramos gavimo funkcionalumas – darbo kopija

## Kas pakeista

1. Prieglaudos paskyros profilyje atsirado „Noriu gauti paramą“ forma.
2. Forma renka sąskaitos savininką, banką, IBAN ir neprivalomas mokėjimo instrukcijas.
3. Pateiktas prašymas gauna būseną „Laukia“.
4. Administravimo skydelyje pridėtas skirtukas „Paramos prašymai“ su patvirtinimo ir atmetimo veiksmais.
5. Patvirtinus prašymą, viešame prieglaudos profilyje atsiranda „Paremti“ mygtukas.
6. Paspaudus mygtuką parodomi bankinio pavedimo rekvizitai. Lankytojas pats atlieka pavedimą savo banke; Fauner pinigų nepriima ir neapdoroja.
7. Po atmetimo prieglauda gali patikslinti duomenis ir pateikti prašymą dar kartą.

## Kaip išbandyti DEMO režimu

Šioje kopijoje `js/config.js` Supabase nustatymai išvalyti. Duomenys saugomi tik tos naršyklės `localStorage`, todėl komandos Supabase projektas nepasiekiamas.

1. Išskleiskite ZIP į atskirą aplanką.
2. Atidarykite tą aplanką su VS Code.
3. Paleiskite `index.html` per „Live Server“.
4. Prisijunkite kaip prieglauda: `letenele@demo.lt`. DEMO režime slaptažodis gali būti bet koks.
5. Atidarykite „Profilis“ ir pateikite paramos rekvizitus. Naudokite tik netikrus testinius duomenis.
6. Atsijunkite ir prisijunkite kaip administratorius: `admin@demo.lt` (bet koks slaptažodis).
7. Administravimas → „Paramos prašymai“ → patvirtinkite pateiktą prašymą.
8. Atsijunkite ir atidarykite prieglaudos viešą profilį. Ten turi būti „Paremti“ mygtukas ir patvirtinti rekvizitai.

Atmetimo scenarijui administratoriaus skydelyje pasirinkite „Atmesti“. Tada prisijunkite kaip prieglauda ir pateikite patikslintus duomenis.

## Supabase diegimas ateityje

SQL migracija: `supabase/20261124_shelter_donations.sql`.

Jos dar nevykdykite komandos produkcinėje Supabase duomenų bazėje. Pirmiausia reikia:
- sukurti atskirą testinį Supabase projektą arba duomenų bazės kopiją;
- įsitikinti, kad ten yra dabartinė Fauner schema ir `public.is_admin()` bei `public.is_active()` funkcijos;
- peržiūrėti ir atskiroje aplinkoje išbandyti migraciją;
- tik tada įrašyti testinio projekto URL ir publishable raktą į šios darbo kopijos `js/config.js`.

Migracija kuria naują lentelę ir dvi saugias `SECURITY DEFINER` funkcijas. Rekvizitai viešai skaitomi tik tada, kai būsena „Patvirtinta“; prašymą pateikti gali tik prisijungusi, aktyvi ir patvirtinta prieglauda; peržiūrėti gali administratorius.

## Ribos

- Mokėjimų tiekėjas ir automatinis pinigų surinkimas neintegruojami.
- 3 darbo dienų terminas rodomas prieglaudai kaip administratoriaus peržiūros terminas; tai nėra automatinis priminimas ar SLA vykdymo sistema.
- DEMO režimo duomenys nėra tikra duomenų bazė ir neturi būti naudojami tikriems banko rekvizitams.
