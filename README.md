# Fauner

**Fauner** – nemokama gyvūnų priglaudimo platforma Lietuvai. Prieglaudos ir žmonės, atiduodantys augintinius, skelbia gyvūnus, o ieškantys augintinio randa naują draugą. Gyvūnai per Fauner atiduodami **tik nemokamai**.

🔗 **Svetainė:** https://sarunasmaurusaitis-droid.github.io/fauner/

> Tai mokomasis KTU projektas (modulis T120B207). Svetainėje esančios prieglaudos ir globėjai, pažymėti „(demo)“, yra išgalvoti ir skirti tik testavimui.

## Komanda (grupė 01-2)

Ainė Matulevičiūtė · Ignas Onaitis · Deividas Paulauskis · Šarūnas Maurušaitis · Edvinas Žilaitis

## Pagrindinės funkcijos

- **Paieška ir filtrai:** rūšis, veislė (su mišrūnais), amžius nuo–iki, miestas ar rajonas, lytis.
- **Gyvūno profilis:** nuotraukų galerija, sveikata, aprašymas, dalinimasis, išsaugojimas.
- **Užklausa priglausti:** trumpas klausimynas, žinutės, eilė rezervuotam gyvūnui.
- **Skelbimai:** įkėlimas per 4 žingsnius, redagavimas, archyvas, kandidatų atranka.
- **Prieglaudos:** paraiška pagal VMVT reikalavimus, žyma „Patvirtinta prieglauda“, skydelis.
- **Saugumas:** tik pilnamečiai (18+), skelbimai su kaina tikrinami prieš paskelbiant, pranešimai apie netinkamus skelbimus, moderavimas.
- **Prisijungimas:** el. paštu, per Google arba Facebook.

## Technologijos

- HTML, CSS ir JavaScript (be papildomų bibliotekų ir „build“ žingsnio)
- [Supabase](https://supabase.com) – PostgreSQL duomenų bazė, paskyros, failų saugykla
- GitHub Pages – talpinimas
- Dizainas – Figma (W9 prototipas)

## Struktūra

```
index.html          pagrindinis puslapis
css/style.css       stilius
js/app.js           navigacija ir bendros funkcijos
js/pages/           puslapiai (paieška, profilis, žinutės, skelbimai, paskyra, administravimas, informacija)
js/api.js           darbas su duomenų baze
supabase/           duomenų bazės struktūra
docs/               komandos dokumentai (tyrimai, duomenų modelis, testavimas)
```
