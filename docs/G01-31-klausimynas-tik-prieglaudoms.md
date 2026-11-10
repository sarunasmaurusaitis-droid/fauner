# G01-31 – Klausimynas tik prieglaudoms

## Įgyvendinimas

Vartotojo kelias: **Paieška → Gyvūno profilis → „Noriu priglausti“ → Užklausos forma → Žinutės**.

- Jei **skelbimo autoriaus rolė `shelter`**, rodomas prieglaudos klausimynas: vardas ir pavardė, miestas, neprivalomas telefonas, būstas, leidimas laikyti gyvūną, kiti augintiniai, laikas vienam, priežiūros patirtis, motyvacija, neprivaloma papildoma informacija.
- Jei **skelbimo autoriaus rolė `user`**, rodoma tik žinutės forma. Vartotojo vardas perduodamas iš prisijungusios paskyros, papildomos informacijos įvesti nereikia.
- Užklausa išsaugoma **esamoje `requests` lentelėje**. Be naujos DB migracijos: `housing` ir `has_pets` saugomi kaip anksčiau, papildomi atsakymai pridedami prie `motivation` kaip aiškiai pažymėtas tekstas. Privačiam globėjui `motivation` saugo pirminę žinutę.
- Kandidatų ekrane ir pokalbyje atvaizduojama skirtinga informacija: klausimynas prieglaudoms, pradinė žinutė privatiems globėjams. Anksčiau sukurtos užklausos išlieka skaitomos.
- Peržiūra priklauso nuo **skelbimo autoriaus rolės**, ne nuo prieglaudos `verified` žymos: taip klausimynas matomas ir dar nepatvirtintai prieglaudai.

## Testavimas

1. Prisijunkite kaip įprastas vartotojas ir pasirinkite gyvūną, kurį skelbia prieglauda. Paspaudus „Noriu priglausti“ turi pasirodyti pilnas klausimynas.
2. Užpildykite klausimyną. Prieglaudos kandidatų lange ir pokalbyje turi matytis atsakymai. Pareiškėjo pusėje taip pat galima išskleisti savo atsakymus.
3. Pasirinkite gyvūną iš privataus globėjo skelbimo. Turi matytis **tik** žinutės laukas (be klausimyno ir kontakto laukų).
4. Išsiųskite žinutę. Privatus globėjas ją mato kandidatuose ir pokalbio pradžioje; pareiškėjas mato savo išsiųstą žinutę.
5. Patikrinkite užsakymus „Stoti į eilę“ rezervuotam gyvūnui, kurio eilė atvira – ta pati sąlyginė forma turi veikti ir ten.
6. Patikrinkite senas užklausas, sukurtas prieš G01-31 pakeitimą – jos neturi dingti ar nustoti atsidaryti.

## Priėmimo kriterijai

- [x] Kreipiantis į prieglaudą rodomas klausimynas.
- [x] Kreipiantis į privatų globėją rodomas tik žinutės laukas.

**Pastaba.** Kodo įgyvendinimas paruoštas, bet šios aplinkos neturi prisijungimo prie tikrosios Supabase paskyros – prieš uždarant užduotį patikrinkite abu srautus svetainėje.
