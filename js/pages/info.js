// Informaciniai puslapiai: Apie Fauner + DUK, taisyklės, privatumo politika, kontaktai, pirmo apsilankymo gidas
import { esc, $, $$, icon, go } from '../app.js?v=11';
import { CONTACT_EMAIL } from '../config.js?v=11';

const UPDATED = '2026-11-03';
const email = () => CONTACT_EMAIL ? `<a class="link" href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>` : 'per skiltį „Kontaktai“';

const FAQ = [
  ['Ar Fauner tikrai nemokamas?', 'Taip. Naudotis Fauner nemokama visiems – ir ieškantiems gyvūno, ir atiduodantiems, ir prieglaudoms. Gyvūnai per Fauner taip pat atiduodami tik nemokamai: skelbimuose negali būti kainos, užstato ar kitokio mokesčio.'],
  ['Kodėl negalima parduoti gyvūnų?', 'Fauner sukurtas tam, kad gyvūnai rastų gerus namus, o ne tam, kad iš jų būtų uždirbama. Pardavimo skelbimai skatina nekontroliuojamą veisimą ir apgavystes. Jei skelbime randame žodžių apie kainą ar pinigus, jis paslepiamas, kol administratorius jį peržiūri.'],
  ['Kaip priglausti gyvūną?', 'Susirask gyvūną paieškoje, atidaryk jo profilį ir paspausk „Noriu priglausti“. Užpildyk trumpą klausimyną – jis keliauja prieglaudai arba globėjui. Atsakymą gausi skiltyje „Žinutės“, ten galėsite susitarti dėl susitikimo.'],
  ['Ką reiškia „Rezervuotas“ ir „Stoti į eilę“?', 'Rezervuotas gyvūnas jau turi pasirinktą būsimą šeimininką. Jei globėjas leidžia, gali stoti į eilę – jei su pirmuoju kandidatu nepavyks, globėjas susisieks su eilėje esančiais pagal tai, kas parašė pirmas.'],
  ['Kaip atiduoti savo augintinį?', 'Prisijunk, eik į „Skelbimai“ → „Naujas skelbimas“ ir per 4 žingsnius įkelk nuotraukas, pagrindinę informaciją, charakterį ir aprašymą. Kai kas nors susidomės, gausi užklausą su klausimynu ir pats išsirinksi naujus šeimininkus.'],
  ['Kaip tapti patvirtinta prieglauda?', 'Užsiregistruok, tada profilyje paspausk „Pateikti paraišką“. Nurodyk organizacijos duomenis, VMVT gyvūnų globėjų sąrašo įrašą ar globos vietos veterinarinio patvirtinimo numerį ir pridėk dokumentus. Administratorius patikrins duomenis viešuose registruose, paprastai per 1–3 darbo dienas.'],
  ['Kodėl reikia būti 18 metų?', 'Gyvūno priglaudimas yra atsakingas sprendimas, o globėjams pagal VMVT reikalavimus gyvūnai perduodami rašytine sutartimi. Todėl Fauner gali naudotis tik pilnamečiai. Gimimo data niekam nerodoma.'],
  ['Kaip pasirinkti veislę, jei gyvūnas mišrūnas?', 'Pasirink veislę, į kurią gyvūnas labiausiai panašus, ir pažymėk „Mišrūnas“. Tada jį ras ir ieškantys tos veislės. Jei visai nežinai – rinkis „Nežinoma (mišrūnas)“.'],
  ['Ką daryti pastebėjus įtartiną skelbimą?', 'Gyvūno profilyje paspausk „Pranešti apie skelbimą“ ir pasirink priežastį. Pranešimas anonimiškas, administratorius jį peržiūri per 24 val.'],
  ['Ar mano kontaktai matomi visiems?', 'Ne. Telefoną ir klausimyno atsakymus mato tik to gyvūno globėjas ar prieglauda, kuriai siunti užklausą. Viešai rodomas tik tavo vardas, miestas ir profilio nuotrauka.'],
  ['Kaip ištrinti paskyrą?', 'Profilis → Paskyros nustatymai → „Ištrinti paskyrą“. Kartu visam laikui ištrinami tavo skelbimai, užklausos ir žinutės.'],
  ['Ar Fauner patikrina gyvūnų sveikatą?', 'Ne. Sveikatos informaciją pateikia globėjas ar prieglauda. Prieš priglausdamas paprašyk veterinarinio paso ir įsitikink, kad gyvūnas paženklintas mikroschema ir įregistruotas Gyvūnų augintinių registre (GAR).'],
];

export async function renderAbout(box) {
  box.innerHTML = `
    <section class="hero-about">
      <h1>Fauner – gyvūnai atiduodami tik nemokamai</h1>
      <p class="lead">Fauner – nemokama platforma, kurioje prieglaudos ir žmonės, atiduodantys augintinius, skelbia gyvūnus, o ieškantys augintinio randa naują draugą. Viskas vienoje vietoje: paieška, skelbimas, užklausa ir pokalbis.</p>
      <div class="row gap wrap"><a class="btn primary" href="#/">Ieškoti gyvūno</a><a class="btn ghost" href="#/skelbimai/naujas">Atiduoti augintinį</a></div>
    </section>
    <div class="free-banner">${icon('heart')} <span><b>Ne pardavimui.</b> Fauner draudžiama prekiauti gyvūnais – jokių kainų, užstatų ar „simbolinių“ mokesčių.</span></div>
    <h2>Kaip tai veikia</h2>
    <div class="steps3">
      <div class="panel"><span class="step-n">1</span><h3>Rask</h3><p class="sub">Filtruok pagal rūšį, veislę, amžių, miestą ir charakterį. Išsaugok patikusius širdele.</p></div>
      <div class="panel"><span class="step-n">2</span><h3>Parašyk</h3><p class="sub">Paspausk „Noriu priglausti“ ir užpildyk trumpą klausimyną. Prieglauda atsakys žinutėse.</p></div>
      <div class="panel"><span class="step-n">3</span><h3>Susipažink</h3><p class="sub">Susitarkite dėl susitikimo. Kai gyvūnas randa namus, skelbimas pažymimas „Rado namus“.</p></div>
    </div>
    <h2>Kam skirtas Fauner</h2>
    <div class="steps3">
      <div class="panel"><h3>Ieškantiems augintinio</h3><p class="sub">Visi gyvūnai vienoje vietoje, su aiškiu statusu ir patvirtintomis prieglaudomis.</p></div>
      <div class="panel"><h3>Atiduodantiems augintinį</h3><p class="sub">Skelbimas per 5 minutes ir galimybė pačiam išsirinkti naujus šeimininkus.</p></div>
      <div class="panel"><h3>Prieglaudoms</h3><p class="sub">Skydelis visiems gyvūnams, užklausos su klausimynu ir žyma „Patvirtinta prieglauda“.</p></div>
    </div>
    <h2 id="duk">Dažniausiai užduodami klausimai</h2>
    <div class="faq">${FAQ.map(([q, a]) => `<details class="panel"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    <p class="sub">Neradai atsakymo? Parašyk mums ${email()}.</p>
    <p class="sub small">Fauner – KTU studentų projektas (grupė 01-2): Ainė Matulevičiūtė, Ignas Onaitis, Deividas Paulauskis, Šarūnas Maurušaitis, Edvinas Žilaitis.</p>`;
}

export async function renderRules(box) {
  box.innerHTML = `
    <article class="doc">
      <h1>Fauner naudojimosi taisyklės</h1>
      <p class="sub">Atnaujinta ${UPDATED}</p>

      <h2>1. Bendrosios nuostatos</h2>
      <p>1.1. Fauner (toliau – Platforma) – nemokama interneto platforma, skirta naminiams gyvūnams rasti naujus namus. Platformą kuria KTU studentų komanda (grupė 01-2) kaip mokomąjį projektą.</p>
      <p>1.2. Registruodamasis ir naudodamasis Platforma, vartotojas patvirtina, kad perskaitė šias taisykles bei <a class="link" href="#/privatumas">privatumo politiką</a> ir su jomis sutinka.</p>
      <p>1.3. Platforma tik suveda gyvūnus atiduodančius ir ieškančius žmones. Gyvūno perdavimo sutartis sudaroma tiesiogiai tarp globėjo (prieglaudos) ir naujojo šeimininko – Platforma nėra šios sutarties šalis.</p>

      <h2>2. Pagrindinis principas – gyvūnai neparduodami</h2>
      <p>2.1. <b>Per Fauner gyvūnai atiduodami tik nemokamai.</b> Draudžiama skelbti kainą, prašyti užstato, „kompensacijos už išlaidas“, „simbolinio mokesčio“, dovanų ar bet kokio kito atlygio už gyvūną.</p>
      <p>2.2. Draudžiama skelbti gyvūnus, išaugintus pardavimui ar veisimui, taip pat siūlyti kergimo paslaugas.</p>
      <p>2.3. Skelbimai, kuriuose randama su pardavimu ar pinigais susijusių žodžių, automatiškai paslepiami, kol juos peržiūri administratorius. Pažeidęs šį principą vartotojas gali būti užblokuotas.</p>

      <h2>3. Registracija ir paskyra</h2>
      <p>3.1. Naudotis Platforma gali tik <b>pilnamečiai (18 metų ir vyresni)</b> asmenys. Registruojantis nurodoma gimimo data; ji niekam nerodoma.</p>
      <p>3.2. Vienas asmuo gali turėti vieną paskyrą. Draudžiama apsimesti kitu asmeniu ar organizacija.</p>
      <p>3.3. Vartotojas atsako už savo prisijungimo duomenų saugumą ir už visus veiksmus, atliktus jo paskyroje.</p>
      <p>3.4. Paskyrą galima bet kada ištrinti profilio nustatymuose. Kartu ištrinami skelbimai, užklausos ir žinutės.</p>

      <h2>4. Prieglaudos</h2>
      <p>4.1. Žymą „Patvirtinta prieglauda“ gauna organizacijos ir asmenys, pateikę paraišką ir patvirtinti administratoriaus.</p>
      <p>4.2. Paraiškoje nurodomas VMVT gyvūnų globėjų sąrašo įrašas arba globos vietos veterinarinio patvirtinimo numeris, juridinio asmens duomenys (jei taikoma), kontaktai ir pridedami dokumentai. Administratorius turi teisę duomenis tikrinti viešuose registruose ir paprašyti papildomos informacijos.</p>
      <p>4.3. Prieglauda privalo laikytis Lietuvos Respublikos gyvūnų gerovės ir apsaugos įstatymo bei VMVT veterinarijos reikalavimų gyvūnų globėjams, įskaitant reikalavimą gyvūnus perduoti rašytine sutartimi ir tik paženklintus bei įregistruotus Gyvūnų augintinių registre (GAR).</p>
      <p>4.4. Pasikeitus duomenims ar nutraukus veiklą, prieglauda privalo atnaujinti informaciją Platformoje. Administratorius gali atšaukti patvirtinimą.</p>

      <h2>5. Skelbimai</h2>
      <p>5.1. Skelbti galima tik <b>naminius gyvūnus</b>: šunis, kates, triušius, graužikus, paukščius, šeškus, namuose laikomus roplius ir akvariumo žuvis. Draudžiama skelbti laukinius, saugomus (įrašytus į Raudonąją knygą) ir kitus gyvūnus, kurių laikyti namuose neleidžiama.</p>
      <p>5.2. Kiekviename skelbime privalo būti: vardas, rūšis, veislė (arba „Nežinoma (mišrūnas)“), apytikslis amžius, lytis, miestas ar rajonas, bent viena tikra gyvūno nuotrauka ir aprašymas.</p>
      <p>5.3. Informacija turi būti teisinga. Draudžiama nuslėpti žinomas gyvūno ligas ar elgesio problemas.</p>
      <p>5.4. Nuotraukose turi būti tas pats gyvūnas. Draudžiama naudoti svetimas, iš interneto paimtas ar netinkamo turinio nuotraukas.</p>
      <p>5.5. Skelbime negalima nurodyti kontaktų (telefono, el. pašto, nuorodų į kitas svetaines) – bendravimas vyksta per Platformos žinutes.</p>
      <p>5.6. Gyvūnui radus namus, skelbėjas turi pažymėti „Rado namus“ arba skelbimą archyvuoti.</p>

      <h2>6. Užklausos ir bendravimas</h2>
      <p>6.1. Užklausoje pateikiama tikra informacija apie save ir gyvenimo sąlygas.</p>
      <p>6.2. Draudžiama siųsti šlamštą, įžeidinėti, grasinti, prašyti pinigų ar asmens dokumentų kopijų.</p>
      <p>6.3. Globėjas savo nuožiūra renkasi naujus šeimininkus ir neprivalo paaiškinti atsisakymo priežasčių.</p>
      <p>6.4. Rekomenduojame susitikti gyvai, prieš priglaudžiant susipažinti su gyvūnu ir sudaryti rašytinę perdavimo sutartį.</p>

      <h2>7. Moderavimas ir sankcijos</h2>
      <p>7.1. Bet kuris vartotojas gali pranešti apie netinkamą skelbimą. Pranešimai anonimiški.</p>
      <p>7.2. Administratorius gali be išankstinio įspėjimo paslėpti ar ištrinti taisykles pažeidžiantį skelbimą, užblokuoti ar ištrinti paskyrą.</p>
      <p>7.3. Įtarus žiaurų elgesį su gyvūnais ar prekybą jais, informacija gali būti perduota VMVT ar policijai.</p>

      <h2>8. Atsakomybė</h2>
      <p>8.1. Platforma neatsako už skelbimuose pateiktos informacijos teisingumą, gyvūnų sveikatą ar elgesį ir už susitarimus tarp vartotojų.</p>
      <p>8.2. Platforma veikia „tokia, kokia yra“ ir gali būti laikinai nepasiekiama dėl techninių darbų.</p>

      <h2>9. Baigiamosios nuostatos</h2>
      <p>9.1. Taisyklės gali būti keičiamos. Apie esminius pakeitimus informuojama Platformoje.</p>
      <p>9.2. Klausimus ir skundus siųskite ${email()}.</p>
    </article>`;
}

export async function renderPrivacy(box) {
  box.innerHTML = `
    <article class="doc">
      <h1>Privatumo politika</h1>
      <p class="sub">Atnaujinta ${UPDATED}</p>
      <h2>1. Kas tvarko duomenis</h2>
      <p>Asmens duomenis tvarko Fauner projekto komanda (KTU, grupė 01-2), laikydamasi Bendrojo duomenų apsaugos reglamento (BDAR). Kontaktai: ${email()}.</p>
      <h2>2. Kokius duomenis renkame ir kodėl</h2>
      <ul>
        <li><b>Paskyros duomenys</b> – vardas, el. paštas, slaptažodis (saugomas užšifruotas), miestas, profilio nuotrauka. Tikslas – paskyros sukūrimas ir naudojimasis Platforma (BDAR 6 str. 1 d. b p.).</li>
        <li><b>Gimimo data</b> – tik patikrinti, ar vartotojui yra 18 metų. Niekam nerodoma, ją mato tik pats vartotojas ir administratorius.</li>
        <li><b>Skelbimai</b> – gyvūno informacija ir nuotraukos, kurias vartotojas paskelbia viešai.</li>
        <li><b>Užklausos ir žinutės</b> – klausimyno atsakymai, telefonas (nebūtinas) ir žinutės. Juos mato tik pokalbio dalyviai.</li>
        <li><b>Prieglaudų paraiškos</b> – organizacijos duomenys ir dokumentai. Juos mato tik pareiškėjas ir administratorius.</li>
        <li><b>Pranešimai apie skelbimus</b> – priežastis ir pranešėjas. Pranešėjas skelbimo autoriui nerodomas.</li>
      </ul>
      <h2>3. Kas mato duomenis</h2>
      <p>Viešai matomi tik skelbimai, vartotojo vardas, miestas, profilio nuotrauka ir prieglaudų kontaktai. Duomenys neparduodami ir neperduodami reklamos tikslais.</p>
      <h2>4. Kur saugomi duomenys</h2>
      <p>Duomenys saugomi Supabase (duomenų bazė ir failai, Europos Sąjungos duomenų centras). Svetainė talpinama GitHub Pages. Prisijungiant per Google ar Facebook, šios bendrovės gauna informaciją apie prisijungimą pagal savo privatumo politikas. Šriftai įkeliami iš Google Fonts.</p>
      <h2>5. Slapukai ir naršyklės atmintis</h2>
      <p>Naudojame tik būtiną naršyklės atmintį (localStorage): prisijungimo sesijai ir nustatymams (pvz., ar jau matei įvadinį gidą). Reklaminių ar analitinių slapukų nenaudojame, todėl sutikimo langelio nerodome.</p>
      <h2>6. Kiek laiko saugome</h2>
      <p>Kol paskyra aktyvi. Ištrynus paskyrą, visi su ja susiję duomenys ištrinami iš karto. Atmestos prieglaudų paraiškos saugomos iki 6 mėnesių.</p>
      <h2>7. Tavo teisės</h2>
      <p>Turi teisę susipažinti su savo duomenimis, juos ištaisyti (profilyje), ištrinti (profilyje „Ištrinti paskyrą“), apriboti tvarkymą ir gauti duomenų kopiją. Taip pat gali pateikti skundą Valstybinei duomenų apsaugos inspekcijai (vdai.lrv.lt).</p>
    </article>`;
}

export async function renderContacts(box) {
  box.innerHTML = `
    <article class="doc">
      <h1>Kontaktai</h1>
      <p>Fauner – KTU studentų projektas (modulis T120B207, grupė 01-2).</p>
      <p>Komanda: Ainė Matulevičiūtė, Ignas Onaitis, Deividas Paulauskis, Šarūnas Maurušaitis, Edvinas Žilaitis.</p>
      <p>El. paštas: ${CONTACT_EMAIL ? email() : '<span class="sub">bus paskelbtas netrukus</span>'}</p>
      <p>Pastebėjai netinkamą skelbimą? Naudok mygtuką „Pranešti apie skelbimą“ gyvūno profilyje – taip jis greičiausiai pasieks administratorių.</p>
      <p>Įtari žiaurų elgesį su gyvūnu? Kreipkis į Valstybinę maisto ir veterinarijos tarnybą (<a class="link" href="https://vmvt.lrv.lt" target="_blank" rel="noopener">vmvt.lrv.lt</a>) arba skambink 112.</p>
    </article>`;
}

// Pirmo apsilankymo gidas (3 žingsniai)
export function maybeShowIntro() {
  let seen = false;
  try { seen = localStorage.getItem('fauner-intro') === '1'; } catch { }
  if (seen || !/^#?\/?$|^#\/\?/.test(location.hash || '#/')) return;
  const slides = [
    ['heart', 'Sveiki atvykę į Fauner!', 'Čia gyvūnai iš prieglaudų ir globėjų ieško naujų namų visoje Lietuvoje. Fauner nemokamas visiems.'],
    ['search', 'Rask ir parašyk', 'Filtruok pagal rūšį, veislę, amžių ir miestą. Patikusį gyvūną išsaugok širdele, o paspaudęs „Noriu priglausti“ užpildyk trumpą klausimyną.'],
    ['shield', 'Ne pardavimui', 'Per Fauner gyvūnai atiduodami tik nemokamai. Skelbimai su kaina tikrinami, o prieglaudos patvirtinamos pagal VMVT duomenis.'],
  ];
  let i = 0;
  const d = document.createElement('div');
  d.className = 'overlay intro';
  const draw = () => {
    const [ic, t, p] = slides[i];
    d.innerHTML = `<div class="dialog intro-card">
      <div class="intro-ic">${icon(ic)}</div><h2>${t}</h2><p class="sub">${p}</p>
      <div class="dots center">${slides.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="row gap"><button class="btn ghost grow" data-skip>${i ? 'Atgal' : 'Praleisti'}</button><button class="btn primary grow" data-next>${i < slides.length - 1 ? 'Toliau' : 'Pradėti'}</button></div>
      <a class="link small center" href="#/apie" data-more>Daugiau apie Fauner ir DUK</a>
    </div>`;
    $('[data-next]', d).onclick = () => { if (i < slides.length - 1) { i++; draw(); } else close(); };
    $('[data-skip]', d).onclick = () => { if (i) { i--; draw(); } else close(); };
    $('[data-more]', d).onclick = () => close();
  };
  const close = () => { try { localStorage.setItem('fauner-intro', '1'); } catch { } d.remove(); };
  draw();
  document.body.appendChild(d);
}
