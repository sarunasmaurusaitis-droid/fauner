# Administravimas

Fauner administravimo modulio aprašas (Jira užduotis G01-33). Skydelis pasiekiamas adresu `#/admin` ir rodomas tik vartotojams, kurių rolė – administratorius.

## Rolės

| Rolė | Ką gali |
|---|---|
| Svečias | Naršyti skelbimus, skaityti informacinius puslapius |
| Vartotojas | Išsaugoti gyvūnus, siųsti užklausas, įkelti skelbimus, pranešti apie netinkamą skelbimą |
| Prieglauda | Viskas, ką gali vartotojas, plius žyma „Patvirtinta prieglauda“ (po paraiškos patvirtinimo) |
| Administratorius | Tikrinti skelbimus, pranešimus ir paraiškas, valdyti vartotojus ir visus skelbimus |

## Skirtukai

### 1. Tikrinami skelbimai
- Kai skelbimo pavadinime ar aprašyme randama žodžių, susijusių su pardavimu ar pinigais (kaina, eurai, parduodu ir pan.), skelbimas automatiškai gauna būseną „Tikrinamas“ ir **niekam nerodomas**, kol administratorius jo nepatikrina.
- Rasti žodžiai paryškinami tekste.
- Veiksmai: **Patvirtinti** (skelbimas paskelbiamas) arba **Atmesti** su priežastimi, kurią mato skelbimo autorius.

### 2. Pranešimai
- Vartotojų pranešimai apie netinkamus skelbimus: priežastis, komentaras, kiek iš viso pranešimų apie tą patį skelbimą.
- Veiksmai: **Atmesti pranešimą**, **Paslėpti skelbimą**, vėliau – **Grąžinti skelbimą**.

### 3. Prieglaudų paraiškos
- Paraiškos duomenys: teisinė forma, juridinio asmens kodas, VMVT įrašas, adresas, atsakingas asmuo, kontaktai, svetainė, įkelti dokumentai (privatūs, mato tik pareiškėjas ir administratorius).
- Tikrinimo eiga: VMVT gyvūnų globėjų sąrašas → Registrų centras / rekvizitai.lt → svetainė ar socialinių tinklų paskyra → skambutis nurodytu telefonu.
- Veiksmai: **Patvirtinti** (rolė „Prieglauda“ ir žyma „Patvirtinta prieglauda“) arba **Atmesti** su priežastimi.

### 4. Vartotojai
- Paieška pagal vardą, el. paštą ar miestą; filtras pagal rolę ir užblokuotus.
- Rodoma: rolė, miestas, skelbimų skaičius, registracijos data, ar užbaigta registracija.
- Veiksmai: keisti rolę, **Blokuoti / Atblokuoti** (užblokuoto vartotojo skelbimai paslepiami, jis negali rašyti žinučių ir kelti skelbimų), **Ištrinti** paskyrą su visais jos duomenimis.
- Administratorius negali pakeisti savo rolės, užblokuoti ar ištrinti savęs.

### 5. Visi skelbimai
- Paieška pagal vardą, veislę, miestą ar savininką; filtrai: be savininko, paslėpti, tikrinami / atmesti.
- Veiksmai: priskirti savininką, redaguoti, paslėpti / rodyti, ištrinti.

## Apsauga duomenų bazėje

Teisės tikrinamos ne tik svetainėje, bet ir Supabase duomenų bazėje (Row Level Security), todėl apeiti jų per naršyklę negalima:

- Pranešimus ir prieglaudų paraiškas skaityti ir tvarkyti gali tik administratorius.
- Rolę, patvirtinimo žymą, blokavimą ir skelbimo tikrinimo būseną gali keisti tik administratorius – tai užtikrina trigeriai `protect_profile` ir `protect_pet`.
- Užblokuotas vartotojas netenka visų veiksmų teisių (`is_active()`), užblokuotas administratorius – administratoriaus teisių (`is_admin()`).
- Pardavimo žodžiai tikrinami duomenų bazės funkcija `sale_words()`, todėl tikrinimas veikia, net jei skelbimas būtų keičiamas apeinant svetainę.

## Kas planuojama (W13)

- G01-55 Įtartinų skelbimų tikrinimas – platesnis žodžių sąrašas (užstatai, prašymai paremti, smurtas) ir skirtukas „Įtartini skelbimai“.
- G01-56 Parama prieglaudoms – paramos rekvizitų tvirtinimas per 3 darbo dienas.
- G01-57 Administravimo skydelio patobulinimai – filtrai, laikotarpiai, sukūrimo datos, nuorodos į profilius.
