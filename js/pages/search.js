// Paieška ir filtrai (filtrai saugomi nuorodoje, todėl jais galima pasidalinti)
import { api } from '../api.js?v=11';
import { esc, $, $$, icon, petCard, bindHearts, ageMonths, plural } from '../app.js?v=11';
import { CITIES, BREEDS, SPECIES, SPECIES_PLURAL } from '../data.js?v=11';
import { combo, dualRange } from '../ui.js?v=11';

const QUICK = [['', 'Visi'], ...SPECIES.map(s => [s, SPECIES_PLURAL[s]])];
const AGE_MAX = 20;
const DEF = () => ({ q: '', species: [], breeds: [], mixed: true, cities: [], sex: '', ageFrom: 0, ageTo: AGE_MAX, reserved: true, verified: false, sort: 'new' });

function readUrl() {
  const F = DEF();
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  if (q.get('q')) F.q = q.get('q');
  if (q.get('rusis')) F.species = q.get('rusis').split('|').filter(s => SPECIES.includes(s));
  if (q.get('misrunai') === '0') F.mixed = false;
  if (q.get('veisle')) F.breeds = q.get('veisle').split('|');
  if (q.get('miestas')) F.cities = q.get('miestas').split('|');
  if (['Patinas', 'Patelė'].includes(q.get('lytis'))) F.sex = q.get('lytis');
  if (q.get('amzius')) { const [a, b] = q.get('amzius').split('-').map(Number); if (a >= 0) F.ageFrom = a; if (b >= 0) F.ageTo = b; }
  if (q.get('rezervuoti') === '0') F.reserved = false;
  if (q.get('patvirtintos') === '1') F.verified = true;
  if (q.get('rikiuoti') === 'jauniausi') F.sort = 'young';
  return F;
}
function writeUrl(F) {
  const q = new URLSearchParams();
  if (F.q) q.set('q', F.q);
  if (F.species.length) q.set('rusis', F.species.join('|'));
  if (!F.mixed) q.set('misrunai', '0');
  if (F.breeds.length) q.set('veisle', F.breeds.join('|'));
  if (F.cities.length) q.set('miestas', F.cities.join('|'));
  if (F.sex) q.set('lytis', F.sex);
  if (F.ageFrom > 0 || F.ageTo < AGE_MAX) q.set('amzius', `${F.ageFrom}-${F.ageTo}`);
  if (!F.reserved) q.set('rezervuoti', '0');
  if (F.verified) q.set('patvirtintos', '1');
  if (F.sort === 'young') q.set('rikiuoti', 'jauniausi');
  const s = q.toString();
  history.replaceState(null, '', '#/' + (s ? '?' + s : ''));
}

function apply(pets, F) {
  const q = F.q.trim().toLowerCase();
  const out = pets.filter(p => {
    const years = ageMonths(p.birth_date) / 12;
    return p.status !== 'Rado namus' &&
      (F.reserved || p.status === 'Laukia namų') &&
      (!q || [p.name, p.city, p.species, p.breed, p.mixed ? 'mišrūnas' : '', p.description, ...(p.traits || [])].join(' ').toLowerCase().includes(q)) &&
      (!F.species.length || F.species.includes(p.species)) &&
      (!F.breeds.length || F.breeds.includes(p.breed)) &&
      (F.mixed || !p.mixed) &&
      (!F.cities.length || F.cities.includes(p.city)) &&
      (!F.sex || p.sex === F.sex) &&
      years >= F.ageFrom && (F.ageTo >= AGE_MAX || years < F.ageTo + 1) &&
      (!F.verified || (p.owner?.role === 'shelter' && p.owner?.verified));
  });
  if (F.sort === 'young') out.sort((a, b) => b.birth_date.localeCompare(a.birth_date));
  return out;
}

const ageLabel = (a, b) => a === 0 && b >= AGE_MAX ? 'bet koks' : b >= AGE_MAX ? `nuo ${a} m.` : a === 0 ? `iki ${b} m.` : `${a}–${b} m.`;

export async function render(box) {
  const pets = await api.listPets();
  const F = readUrl();
  const u = api.user;
  box.innerHTML = `
    <div class="search-layout">
      <aside class="filters panel" id="filters">
        <div class="f-head"><button type="button" class="icon-btn only-mobile" data-close aria-label="Uždaryti">${icon('x')}</button><h3>Filtrai</h3><button type="button" class="link" data-clear>Išvalyti</button></div>
        <label class="f-label">Amžius <span class="sub" id="age-lbl"></span></label>
        <div id="age"></div>
        <label class="f-label">Miestas ar rajonas</label><div id="city"></div>
        <label class="f-label">Veislė</label><div id="breed"></div>
        <label class="f-label">Lytis</label>
        <div class="pills" id="sex">${['', 'Patinas', 'Patelė'].map(v => `<button type="button" class="pill ${F.sex === v ? 'on' : ''}" data-v="${v}">${v || 'Bet kokia'}</button>`).join('')}</div>
        <label class="switch"><span>Įtraukti mišrūnus <span class="sub small">(pvz. „Rusų toiterjeras (mišrūnas)“)</span></span><input type="checkbox" id="mix" ${F.mixed ? 'checked' : ''}><i></i></label>
        <label class="switch"><span>Rodyti rezervuotus</span><input type="checkbox" id="res" ${F.reserved ? 'checked' : ''}><i></i></label>
        <label class="switch"><span>Tik patvirtintos prieglaudos</span><input type="checkbox" id="ver" ${F.verified ? 'checked' : ''}><i></i></label>
        <button type="button" class="btn primary block only-mobile" data-show>Rodyti</button>
      </aside>
      <section>
        <p class="sub hello">${u ? `Sveiki, ${esc((u.name || '').split(' ')[0] || u.shelter_name)}` : 'Gyvūnai, laukiantys namų visoje Lietuvoje'}</p>
        <h1>Rask naują draugą</h1>
        <div class="searchbar">
          <label class="search-input">${icon('search')}<input type="search" id="q" placeholder="Vardas, veislė ar miestas" value="${esc(F.q)}"></label>
          <button class="icon-btn dark only-mobile" id="open-filters" aria-label="Filtrai">${icon('sliders')}<span class="badge" id="fcount" hidden></span></button>
        </div>
        <div class="pills quick" id="quick">${QUICK.map(([v, l]) => `<button class="pill" data-v="${v}">${l}</button>`).join('')}</div>
        <div class="row between result-head"><b id="count"></b>
          <select id="sort" class="select-plain" aria-label="Rikiuoti"><option value="new">Naujausi</option><option value="young">Jauniausi</option></select></div>
        <div class="grid" id="grid"></div>
      </section>
    </div>`;

  const grid = $('#grid', box), filters = $('#filters', box);
  $('#sort', box).value = F.sort;

  const breedOptions = () => [...new Set((F.species.length ? F.species : SPECIES).flatMap(s => BREEDS[s] || []))].sort((a, b) => a.localeCompare(b, 'lt'));
  const cityCombo = combo($('#city', box), { options: CITIES, value: F.cities, multi: true, allLabel: 'Visa Lietuva', onChange: v => { F.cities = v; draw(); } });
  const breedCombo = combo($('#breed', box), { options: breedOptions(), value: F.breeds, multi: true, allLabel: 'Visos veislės', onChange: v => { F.breeds = v; draw(); } });
  const age = dualRange($('#age', box), { min: 0, max: AGE_MAX, from: F.ageFrom, to: F.ageTo, onChange: (a, b) => { F.ageFrom = a; F.ageTo = b; $('#age-lbl', box).textContent = ageLabel(a, b); draw(); } });

  function draw() {
    const list = apply(pets, F);
    $('#count', box).textContent = `Rasta: ${plural(list.length, 'gyvūnas', 'gyvūnai', 'gyvūnų')}`;
    grid.innerHTML = list.length ? list.map(petCard).join('') : `<div class="empty"><p>Pagal pasirinktus filtrus gyvūnų nerasta.</p><button class="btn ghost" data-clear>Išvalyti filtrus</button></div>`;
    bindHearts(grid);
    $$('[data-clear]', grid).forEach(b => b.onclick = clear);
    const n = F.breeds.length + F.cities.length + (!F.mixed) + (F.sex ? 1 : 0) + (F.ageFrom > 0 || F.ageTo < AGE_MAX ? 1 : 0) + (!F.reserved) + F.verified;
    const badge = $('#fcount', box); badge.hidden = !n; badge.textContent = n;
    $$('#quick .pill', box).forEach(b => b.classList.toggle('on', b.dataset.v ? F.species.includes(b.dataset.v) : !F.species.length));
    $('[data-show]', filters).textContent = `Rodyti ${list.length}`;
    writeUrl(F);
  }
  function clear() {
    Object.assign(F, DEF()); $('#q', box).value = '';
    cityCombo.value = []; breedCombo.setOptions(breedOptions()); breedCombo.value = []; age.set(0, AGE_MAX);
    $$('#sex .pill', box).forEach(b => b.classList.toggle('on', b.dataset.v === ''));
    $('#mix', box).checked = true; breedCombo.setOptions(breedOptions());
    $('#res', box).checked = true; $('#ver', box).checked = false; $('#sort', box).value = 'new';
    draw();
  }

  $$('#sex .pill', box).forEach(b => b.onclick = () => { F.sex = b.dataset.v; $$('#sex .pill', box).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  $('#mix', box).onchange = e => { F.mixed = e.target.checked; draw(); };
  $('#res', box).onchange = e => { F.reserved = e.target.checked; draw(); };
  $('#ver', box).onchange = e => { F.verified = e.target.checked; draw(); };
  $$('[data-clear]', filters).forEach(b => b.onclick = clear);
  $('[data-show]', filters).onclick = () => filters.classList.remove('open');
  $('[data-close]', filters).onclick = () => filters.classList.remove('open');
  $('#q', box).oninput = e => { F.q = e.target.value; draw(); };
  $('#sort', box).onchange = e => { F.sort = e.target.value; draw(); };
  $$('#quick .pill', box).forEach(b => b.onclick = () => {
    const v = b.dataset.v;
    if (!v) F.species = [];
    else F.species = F.species.includes(v) ? F.species.filter(x => x !== v) : [...F.species, v];
    const opts = breedOptions(); F.breeds = F.breeds.filter(x => opts.includes(x));
    breedCombo.setOptions(opts); breedCombo.value = F.breeds; draw();
  });
  $('#open-filters', box).onclick = () => filters.classList.add('open');
  draw();
}
