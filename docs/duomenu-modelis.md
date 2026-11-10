# Duomenų modelis (Database Schema)
1. Duomenų bazės paskirtis
Fauner platformos duomenų bazė sukurta naudojant Supabase (PostgreSQL). Ji skirta vartotojų informacijai, gyvūnų skelbimams, įvaikinimo užklausoms, susirašinėjimui ir administravimo informacijai saugoti.

Duomenų bazę sudaro aštuonios pagrindinės lentelės:
1. profiles – vartotojų profiliai.
2. profile_private – privatūs vartotojų duomenys.
3. pets – gyvūnų skelbimai.
4. favorites – mėgstami gyvūnai.
5. requests – įvaikinimo užklausos.
6. messages – vartotojų susirašinėjimas.
7. reports – pranešimai apie netinkamus skelbimus.
8. shelter_applications – prieglaudų registracijos paraiškos.
   
Pagrindinis duomenų bazės tikslas – užtikrinti sklandų įvaikinimo procesą, leidžiant vartotojams rasti gyvūnus, pateikti įvaikinimo užklausas ir bendrauti su jų savininkais.

2. Duomenų bazės lentelės
2.1. Profiles
Šioje lentelėje saugoma pagrindinė registruotų vartotojų informacija. Kiekvienas vartotojas turi unikalų identifikatorių (id), kuris susiejamas su Supabase autentifikacijos sistema.

atributai:
- id – unikalus vartotojo identifikatorius.
- name – vartotojo vardas.
- role – vartotojo rolė (user, shelter, admin).
- city – gyvenamasis miestas.
- shelter_name – prieglaudos pavadinimas.
- verified – prieglaudos patvirtinimo būsena.
- banned – paskyros blokavimo būsena.
- onboarded – pradinės registracijos užbaigimo būsena.
- phone, website, address, about – kontaktinė ir papildoma informacija.

Ryšiai: lentelė susieta su profile_private, pets, favorites, requests, messages, reports ir shelter_applications.

Prieinamumas: profilio informaciją gali skaityti visi vartotojai, o keisti – pats profilio savininkas arba administratorius.

2.2. Profile_private
Lentelėje saugoma privati vartotojo informacija, kurios nereikia rodyti kitiems platformos naudotojams.

atributai:
- id – vartotojo identifikatorius.
- birth_date – gimimo data.

Ryšiai: id susietas su profiles.id. Tai vienas su vienu (1:1) ryšys.

Prieinamumas: informaciją gali matyti tik pats vartotojas ir administratorius. Gimimo data naudojama pilnametystei patikrinti.

2.3. Pets
Tai pagrindinė platformos lentelė, kurioje saugomi įvaikinimui siūlomų gyvūnų duomenys.

atributai:
- id – gyvūno identifikatorius.
- owner_id – skelbimo savininko identifikatorius.
- name – gyvūno vardas.
- species – gyvūno rūšis.
- breed – veislė.
- birth_date – gimimo data.
- sex – lytis.
- city – miestas.
- description – gyvūno aprašymas.
- traits – charakterio savybės.
- health – sveikatos informacija.
- photos – gyvūno nuotraukos.
- status – įvaikinimo būsena.
- hidden, archived – skelbimo matomumo būsenos.
- review_status – administracinės patikros būsena.

Ryšiai: owner_id susietas su profiles.id. Su gyvūnu taip pat susijusios favorites, requests ir reports lentelės.

Prieinamumas: viešai rodomi tik patvirtinti, nepaslėpti ir nearchyvuoti skelbimai. Savininkas gali tvarkyti savo skelbimus, o administratorius – visus.

2.4. Favorites
Lentelė skirta vartotojų mėgstamiems gyvūnams išsaugoti.

atributai:
- user_id – vartotojo identifikatorius.
- pet_id – gyvūno identifikatorius.
- created_at – įtraukimo į mėgstamus gyvūnus data.

Ryšiai: sujungia profiles ir pets lenteles N:M (daug su daug) ryšiu.

Prieinamumas: kiekvienas vartotojas gali matyti ir tvarkyti tik savo mėgstamų gyvūnų sąrašą.

2.5. Requests
Lentelėje saugomos vartotojų pateiktos įvaikinimo užklausos.

atributai:
- id – užklausos identifikatorius.
- pet_id – gyvūnas, dėl kurio pateikta užklausa.
- seeker_id – užklausą pateikusio vartotojo ID.
- full_name – vardas ir pavardė.
- phone – kontaktinis telefonas.
- city – miestas.
- housing – gyvenimo sąlygos.
- has_pets – ar vartotojas turi kitų gyvūnų.
- motivation – įvaikinimo motyvacija.
- status – užklausos būsena.
- queued – laukimo eilės žyma.

Ryšiai: susieta su profiles ir pets. Viena užklausa gali turėti kelias žinutes, saugomas messages lentelėje.

Prieinamumas: užklausą gali matyti ją pateikęs vartotojas ir gyvūno savininkas.

2.6. Messages
Lentelė skirta vartotojų tarpusavio bendravimui įvaikinimo proceso metu.

atributai:
- id – žinutės identifikatorius.
- request_id – susijusios įvaikinimo užklausos ID.
- sender_id – žinutės siuntėjo ID.
- body – žinutės turinys.
- kind – žinutės tipas.
- created_at – išsiuntimo data.
Ryšiai: request_id susietas su requests.id, o sender_id – su profiles.id.

Prieinamumas: žinutes gali skaityti tik konkrečios įvaikinimo užklausos dalyviai.

2.7. Reports
Lentelė skirta pranešimams apie netinkamus arba įtartinus gyvūnų skelbimus.

atributai:
- id – pranešimo identifikatorius.
- pet_id – skelbimo ID.
- reporter_id – pranešimą pateikusio vartotojo ID.
- reason – pažeidimo priežastis.
- details – papildoma informacija.
- status – pranešimo nagrinėjimo būsena.
- created_at – pateikimo data.
Ryšiai: susieta su pets ir profiles.

Prieinamumas: pranešimus pateikti gali aktyvūs prisijungę vartotojai, tačiau jų turinį skaityti ir tvarkyti gali tik administratorius.

2.8. Shelter_applications
Lentelėje saugomos paraiškos, kurias vartotojai pateikia norėdami registruoti savo organizaciją kaip patvirtintą gyvūnų prieglaudą.

atributai:
- id – paraiškos identifikatorius.
- user_id – paraiškos autoriaus ID.
- org_name – organizacijos pavadinimas.
- legal_form – juridinė forma.
- company_code – įmonės kodas.
- vmvt_ref – VMVT identifikatorius.
- address, city – organizacijos vieta.
- contact_person – kontaktinis asmuo.
- phone, email, website – kontaktinė informacija.
- docs – dokumentų nuorodos.
- status – paraiškos būsena.
- admin_note – administratoriaus pastabos.

Ryšiai: user_id susietas su profiles.id.

Prieinamumas: paraišką mato jos autorius ir administratorius. Tik administratorius gali ją patvirtinti arba atmesti. Patvirtinus paraišką, vartotojo profilis įgyja shelter rolę.

# Fauner – Duomenų bazės ER diagrama

```
mermaid
erDiagram

    profiles ||--o| profile_private : turi
    profiles ||--o{ pets : augina
    profiles ||--o{ favorites : issisaugojo
    pets ||--o{ favorites : issaugota

    profiles ||--o{ requests : issiusti
    pets ||--o{ requests : gauti

    requests ||--o{ messages : talpina
    profiles ||--o{ messages : siuncia

    profiles o|--o{ reports : nusiuncia
    pets ||--o{ reports : gauna

    profiles ||--o{ shelter_applications : nusiuncia

    profiles {
        uuid id PK
        text name
        text role
        text city
        text shelter_name
        boolean verified
        boolean banned
        boolean onboarded
        text avatar_url
        text phone
        text website
        text address
        text about
        timestamptz created_at
    }

    profile_private {
        uuid id PK, FK
        date birth_date
    }

    pets {
        bigint id PK
        uuid owner_id FK
        text org_name
        text name
        text species
        text breed
        boolean mixed
        date birth_date
        text sex
        text city
        text description
        text_array traits
        text_array health
        text_array photos
        text status
        boolean hidden
        boolean archived
        boolean queue_open
        text review_status
        text review_reason
        timestamptz created_at
        timestamptz updated_at
    }

    favorites {
        uuid user_id PK, FK
        bigint pet_id PK, FK
        timestamptz created_at
    }

    requests {
        bigint id PK
        bigint pet_id FK
        uuid seeker_id FK
        text full_name
        text phone
        text city
        text housing
        boolean has_pets
        text motivation
        text status
        boolean queued
        timestamptz seeker_read_at
        timestamptz owner_read_at
        timestamptz created_at
    }

    messages {
        bigint id PK
        bigint request_id FK
        uuid sender_id FK
        text body
        text kind
        timestamptz created_at
    }

    reports {
        bigint id PK
        bigint pet_id FK
        uuid reporter_id FK
        text reason
        text details
        text status
        timestamptz created_at
    }

    shelter_applications {
        bigint id PK
        uuid user_id FK
        text org_name
        text legal_form
        text company_code
        text vmvt_ref
        text address
        text city
        text contact_person
        text phone
        text email
        text website
        text about
        text_array docs
        text status
        text admin_note
        timestamptz created_at
    }
```
