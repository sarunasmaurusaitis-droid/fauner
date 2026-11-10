# Filtrų ir paieškos testavimo rezultatai — Kompiuteris vs. Mobilusis

**Legenda:** ✅ Atlikta · ⚠️ Blokuojama / Negalima ištestuoti · ❌ Neatlikta

| #  | Testavimo atvejis                                              | Tikėtinas rezultatas                                                                                                               | Kompiuterio rezultatas                                               | Mobiliojo rezultatas                           | Būsena        |
|----|----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------|---------------|
| 1  | Išvalyti visus filtrus (viršuje dešinėje)                      | Atstato visus numatytuosius jungiklius („Įtraukti mišrūnus“, „Rodyti rezervuotus“, „Tik patvirtintos prieglaudos“) ir pan.         | Išvalo viską, grąžina numatytuosius jungiklius                       | Taip pat, per filtrų skydelį → Išvalyti        | ✅ Atlikta    |
| 2  | Miesto / rajono filtras (pvz., Kaunas)                         | Rodo tik pasirinkto miesto gyvūnus                                                                                                 | Rodomi tik Kauno gyvūnai                                             | Taip pat                                       | ✅ Atlikta    |
| 3  | Veislės išskleidžiamasis sąrašas (pvz., Velso korgis)          | Rodo tik tikslios pasirinktos veislės gyvūnus                                                                                      | Grąžina korgį Kiwi                                                   | Taip pat                                       | ✅ Atlikta    |
| 4  | Lyties pasirinkimas                                            | Rodo tik pasirinktos lyties gyvūnus                                                                                                | Rodoma tik atitinkama lytis                                          | Taip pat                                       | ✅ Atlikta    |
| 5  | Jungiklis „Įtraukti mišrūnus“                                  | Į rezultatus įtraukia mišrūnus                                                                                                     | Negalima ištestuoti — duomenų bazėje nėra mišrūnų įrašų              | Negalima ištestuoti (tie patys duomenys)       | ⚠️ Blokuojama |
| 6  | Jungiklis „Rodyti rezervuotus“                                 | Kai išjungtas, atrenka neįtraukiant rezervuotų gyvūnų                                                                              | Rezervuotos Mila ir Mėta pranyksta                                   | Taip pat                                       | ✅ Atlikta    |
| 7  | Jungiklis „Tik patvirtintos prieglaudos“                       | Atrenka neįtraukiant skelbimų, kurių autorius nėra patvirtinta prieglauda                                                          | „Maksas, 5 m.“ (globojamas privačiai) yra atrenkamas ir nerodomas    | Taip pat                                       | ✅ Atlikta    |
| 8  | Tekstinė paieška (vardas / veislė / miestas, dalinė arba pilna)| Atrenka nerodant visų įrašų, kuriuose nėra ieškomos frazės                                                                         | Veikia kaip tikėtasi                                                 | Taip pat                                       | ✅ Atlikta    |
| 9  | Gyvūno tipo filtras (pvz., „Šunys“)                            | Rodo tik atitinkamą tipą                                                                                                           | Rodomi tik šunys                                                     | Taip pat                                       | ✅ Atlikta    |
| 10 | Rūšiavimas — pagal amžių (didėjančia tvarka)                   | Rūšiuoja pagal gyvūno amžių didėjančia tvarka                                                                                      | Veikia kaip aprašyta                                                 | Taip pat                                       | ✅ Atlikta    |
| 11 | Rūšiavimas — pagal skelbimo datą                               | Rūšiuoja pagal skelbimo datą                                                                                                       | Veikia kaip aprašyta                                                 | Taip pat                                       | ✅ Atlikta    |
| 12 | Rezultatų skaičius                                             | Rodo teisingą atrinktų elementų skaičių                                                                                            | Teisingas skaičius                                                   | Taip pat                                       | ✅ Atlikta    |

## Apibendrinimas

* **11 / 12 atlikta**
* **1 blokuojama** — jungiklis „Įtraukti mišrūnus“ negali būti patikrintas (duomenų bazėje nėra mišrūnų įrašų)

## Pastaba dėl mobiliojo įrenginio

Visi filtrai yra patalpinti viename **Filtrų** mygtuke / skydelyje. Veikimas identiškas kompiuterinei versijai — ta pati filtravimo logika, tie patys jungikliai, tas pats rūšiavimas ir tas pats rezultatų skaičius.

## Tobulinimai

Beveik viskas veikia kaip ir planuota, bet reikėtų prideti daugiau filtrų kurie tik dėl mišrūnų. Mišrūno panašiausią rūšį labai sudėtinga nuspėti, todėl reiktų filtro pagal kailio spalvas, ausies formas (nuleipusios, styrancios).
Iki pilnos laimės duoti meilės mišrūnams.

## PAKEITIMAI

Filtravimas pagal tai ar gyvūnas yra mišrunas ar ne veikia, per demo rėžima įdėjus paprastą mišrūną, mygtukas "Įtraukti mišrūnus" jį įtraukią į sąrašą. (Veikia kaip turėtų)