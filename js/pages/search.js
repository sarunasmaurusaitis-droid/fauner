// Paieška ir filtrai (filtrai saugomi nuorodoje, todėl jais galima pasidalinti)
import { api } from '../api.js?v=11';
import { esc, $, $$, icon, petCard, bindHearts, ageMonths, plural } from '../app.js?v=11';
import { CITIES, BREEDS, SPECIES, SPECIES_PLURAL, EYE_COLORS, FUR_COLORS, ANIMAL_HEIGHT, FUR_TYPE, EAR_TYPE } from '../data.js?v=11';
import { combo, dualRange } from '../ui.js?v=11';

const QUICK = [['', 'Visi'], ...SPECIES.map(s => [s, SPECIES_PLURAL[s]])];
const TRAIT_SPECIES = ['Šuo', 'Katė'];
const AGE_MAX = 20;
const DEF = () => ({
  q: '',
  species: [],
  breeds: [],
  mixedOnly: false,
  moreFilters: false,
  eyeColors: [],
  furColors: [],
  heights: [],
  furTypes: [],
  earTypes: [],
  cities: [],
  sex: '',
  ageFrom: 0,
  ageTo: AGE_MAX,
  reserved: true,
  verified: false,
  sort: 'new'
});

function readUrl() {
  const F = DEF();
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  if (q.get('q')) F.q = q.get('q');
  if (q.get('rusis')) F.species = q.get('rusis').split('|').filter(s => SPECIES.includes(s));
  if (q.get('misrunas') === '1') F.mixedOnly = true;
  if (q.get('daugiau') === '1') F.moreFilters = true;
  if (q.get('veisle')) F.breeds = q.get('veisle').split('|');
  if (q.get('akys')) F.eyeColors = q.get('akys').split('|');
  if (q.get('kailio_spalva')) F.furColors = q.get('kailio_spalva').split('|');
  if (q.get('ugis')) F.heights = q.get('ugis').split('|');
  if (q.get('kailio_tipas')) F.furTypes = q.get('kailio_tipas').split('|');
  if (q.get('ausys')) F.earTypes = q.get('ausys').split('|');
  if (q.get('miestas')) F.cities = q.get('miestas').split('|');
  if (['Patinas', 'Patelė'].includes(q.get('lytis'))) F.sex = q.get('lytis');
  if (q.get('amzius')) {
    const [a, b] = q.get('amzius').split('-').map(Number);
    if (a >= 0) F.ageFrom = a;
    if (b >= 0) F.ageTo = b;
  }
  if (q.get('rezervuoti') === '0') F.reserved = false;
  if (q.get('patvirtintos') === '1') F.verified = true;
  if (q.get('rikiuoti') === 'jauniausi') F.sort = 'young';
  if (F.eyeColors.length || F.furColors.length || F.heights.length || F.furTypes.length || F.earTypes.length) {
    F.moreFilters = true;
  }
  return F;
}

function writeUrl(F) {
  const q = new URLSearchParams();
  if (F.q) q.set('q', F.q);
  if (F.species.length) q.set('rusis', F.species.join('|'));
  if (F.mixedOnly) q.set('misrunas', '1');
  if (F.moreFilters) q.set('daugiau', '1');
  if (F.breeds.length) q.set('veisle', F.breeds.join('|'));
  if (F.eyeColors.length) q.set('akys', F.eyeColors.join('|'));
  if (F.furColors.length) q.set('kailio_spalva', F.furColors.join('|'));
  if (F.heights.length) q.set('ugis', F.heights.join('|'));
  if (F.furTypes.length) q.set('kailio_tipas', F.furTypes.join('|'));
  if (F.earTypes.length) q.set('ausys', F.earTypes.join('|'));
  if (F.cities.length) q.set('miestas', F.cities.join('|'));
  if (F.sex) q.set('lytis', F.sex);
  if (F.ageFrom > 0 || F.ageTo < AGE_MAX) q.set('amzius', `${F.ageFrom}-${F.ageTo}`);
  if (!F.reserved) q.set('rezervuoti', '0');
  if (F.verified) q.set('patvirtintos', '1');
  if (F.sort === 'young') q.set('rikiuoti', 'jauniausi');
  const s = q.toString();
  history.replaceState(null, '', '#/' + (s ? '?' + s : ''));
}

function hasAny(selected, petVal) {
  if (!selected.length) return true;
  if (!petVal) return false;
  return Array.isArray(petVal) ? selected.some(v => petVal.includes(v)) : selected.includes(petVal);
}

function traitsAllowedForSpecies(speciesList) {
  if (!speciesList.length) return true;
  return speciesList.some(s => TRAIT_SPECIES.includes(s));
}

function apply(pets, F) {
  const q = F.q.trim().toLowerCase();
  const checkTraits = traitsAllowedForSpecies(F.species) && F.moreFilters;
  const out = pets.filter(p => {
    const years = ageMonths(p.birth_date) / 12;
    return p.status !== 'Rado namus' &&
      (F.reserved || p.status === 'Laukia namų') &&
      (!q || [
        p.name, p.city, p.species, p.breed, p.mixed ? 'mišrūnas' : '', p.description,
        ...(p.traits || []), ...(p.eye_color || []), ...(p.fur_color || []),
        ...(p.height || []), ...(p.fur_type || []), ...(p.ear_type || [])
      ].join(' ').toLowerCase().includes(q)) &&
      (!F.species.length || F.species.includes(p.species)) &&
      (!F.mixedOnly || p.mixed) &&
      (F.mixedOnly || !F.breeds.length || F.breeds.includes(p.breed)) &&
      (!checkTraits || (
        hasAny(F.eyeColors, p.eye_color) &&
        hasAny(F.furColors, p.fur_color) &&
        hasAny(F.heights, p.height) &&
        hasAny(F.furTypes, p.fur_type) &&
        hasAny(F.earTypes, p.ear_type)
      )) &&
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
        <div class="f-head">
          <button type="button" class="icon-btn only-mobile" data-close aria-label="Uždaryti">${icon('x')}</button>
          <h3>Filtrai</h3>
          <button type="button" class="link" data-clear>Išvalyti</button>
        </div>
        <label class="f-label">Amžius <span class="sub" id="age-lbl"></span></label>
        <div id="age"></div>
        <label class="f-label">Miestas ar rajonas</label><div id="city"></div>

        <div id="breed-box" ${F.mixedOnly ? 'hidden' : ''}>
          <label class="f-label">Veislė</label><div id="breed"></div>
        </div>

        <label class="switch">
          <span>Nenori veislės? Rinkis mišrūną</span>
          <input type="checkbox" id="mix" ${F.mixedOnly ? 'checked' : ''}><i></i>
        </label>

        <label class="switch" id="more-wrap">
          <span>Daugiau filtrų</span>
          <input type="checkbox" id="more" ${F.moreFilters ? 'checked' : ''}><i></i>
        </label>

        <div id="mutt-box" hidden>
          <label class="f-label">Akių spalvos</label><div id="eye-color"></div>
          <label class="f-label">Kailio spalva(-os)</label><div id="fur-color"></div>
          <label class="f-label">Ūgis</label><div id="animal-height"></div>
          <label class="f-label">Kailio tipas</label><div id="fur-type"></div>
          <label class="f-label">Ausys</label><div id="ear-type"></div>
        </div>

        <label class="f-label">Lytis</label>
        <div class="pills" id="sex">${['', 'Patinas', 'Patelė'].map(v => `<button type="button" class="pill ${F.sex === v ? 'on' : ''}" data-v="${v}">${v || 'Bet kokia'}</button>`).join('')}</div>
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
        <div class="row between result-head">
          <b id="count"></b>
          <select id="sort" class="select-plain" aria-label="Rikiuoti">
            <option value="new">Naujausi</option>
            <option value="young">Jauniausi</option>
          </select>
        </div>
        <div class="grid" id="grid"></div>
      </section>
    </div>`;

  const grid = $('#grid', box), filters = $('#filters', box);
  $('#sort', box).value = F.sort;

  const breedOptions = () => [...new Set((F.species.length ? F.species : SPECIES).flatMap(s => BREEDS[s] || []))].sort((a, b) => a.localeCompare(b, 'lt'));
  const cityCombo = combo($('#city', box), { options: CITIES, value: F.cities, multi: true, allLabel: 'Visa Lietuva', onChange: v => { F.cities = v; draw(); } });
  const breedCombo = combo($('#breed', box), { options: breedOptions(), value: F.breeds, multi: true, allLabel: 'Visos veislės', onChange: v => { F.breeds = v; draw(); } });
  const eyeCombo = combo($('#eye-color', box), { options: EYE_COLORS, value: F.eyeColors, multi: true, allLabel: 'Visos', onChange: v => { F.eyeColors = v; draw(); } });
  const furColorCombo = combo($('#fur-color', box), { options: FUR_COLORS, value: F.furColors, multi: true, allLabel: 'Visos', onChange: v => { F.furColors = v; draw(); } });
  const heightCombo = combo($('#animal-height', box), { options: ANIMAL_HEIGHT, value: F.heights, multi: true, allLabel: 'Visi', onChange: v => { F.heights = v; draw(); } });
  const furTypeCombo = combo($('#fur-type', box), { options: FUR_TYPE, value: F.furTypes, multi: true, allLabel: 'Visi', onChange: v => { F.furTypes = v; draw(); } });
  const earCombo = combo($('#ear-type', box), { options: EAR_TYPE, value: F.earTypes, multi: true, allLabel: 'Visos', onChange: v => { F.earTypes = v; draw(); } });
  const age = dualRange($('#age', box), {
    min: 0,
    max: AGE_MAX,
    from: F.ageFrom,
    to: F.ageTo,
    onChange: (a, b) => {
      F.ageFrom = a;
      F.ageTo = b;
      $('#age-lbl', box).textContent = ageLabel(a, b);
      draw();
    }
  });
  $('#age-lbl', box).textContent = ageLabel(F.ageFrom, F.ageTo);

  function clearTraits() {
    F.eyeColors = [];
    F.furColors = [];
    F.heights = [];
    F.furTypes = [];
    F.earTypes = [];
    eyeCombo.value = [];
    furColorCombo.value = [];
    heightCombo.value = [];
    furTypeCombo.value = [];
    earCombo.value = [];
  }

  function syncTraitVisibility() {
    const canUseTraits = traitsAllowedForSpecies(F.species);
    $('#more-wrap', box).hidden = !canUseTraits;
    if (!canUseTraits) {
      F.moreFilters = false;
      $('#more', box).checked = false;
      clearTraits();
    }
    $('#mutt-box', box).hidden = !(canUseTraits && F.moreFilters);
  }

  function setMuttMode(on) {
    F.mixedOnly = on;
    $('#mix', box).checked = on;
    $('#breed-box', box).hidden = on;
    if (on) {
      F.breeds = [];
      breedCombo.value = [];
    }
    syncTraitVisibility();
  }

  function setMoreFilters(on) {
    F.moreFilters = on;
    $('#more', box).checked = on;
    if (!on) clearTraits();
    syncTraitVisibility();
  }

  function draw() {
    syncTraitVisibility();
    const list = apply(pets, F);
    $('#count', box).textContent = `Rasta: ${plural(list.length, 'gyvūnas', 'gyvūnai', 'gyvūnų')}`;
    grid.innerHTML = list.length
      ? list.map(petCard).join('')
      : `<div class="empty"><p>Pagal pasirinktus filtrus gyvūnų nerasta.</p><button class="btn ghost" data-clear>Išvalyti filtrus</button></div>`;
    bindHearts(grid);
    $$('[data-clear]', grid).forEach(b => (b.onclick = clear));

    const n = F.breeds.length + F.cities.length + (F.mixedOnly ? 1 : 0) + (F.moreFilters ? 1 : 0) +
      F.eyeColors.length + F.furColors.length + F.heights.length + F.furTypes.length + F.earTypes.length +
      (F.sex ? 1 : 0) + (F.ageFrom > 0 || F.ageTo < AGE_MAX ? 1 : 0) + (!F.reserved) + F.verified;
    const badge = $('#fcount', box);
    badge.hidden = !n;
    badge.textContent = n;

    $$('#quick .pill', box).forEach(b => b.classList.toggle('on', b.dataset.v ? F.species.includes(b.dataset.v) : !F.species.length));
    $('[data-show]', filters).textContent = `Rodyti ${list.length}`;
    writeUrl(F);
  }

  function clear() {
    Object.assign(F, DEF());
    $('#q', box).value = '';
    cityCombo.value = [];
    breedCombo.setOptions(breedOptions());
    breedCombo.value = [];
    clearTraits();
    setMuttMode(false);
    setMoreFilters(false);
    age.set(0, AGE_MAX);
    $('#age-lbl', box).textContent = ageLabel(0, AGE_MAX);
    $$('#sex .pill', box).forEach(b => b.classList.toggle('on', b.dataset.v === ''));
    $('#res', box).checked = true;
    $('#ver', box).checked = false;
    $('#sort', box).value = 'new';
    draw();
  }

  $$('#sex .pill', box).forEach(b => (b.onclick = () => {
    F.sex = b.dataset.v;
    $$('#sex .pill', box).forEach(x => x.classList.toggle('on', x === b));
    draw();
  }));
  $('#mix', box).onchange = e => { setMuttMode(e.target.checked); draw(); };
  $('#more', box).onchange = e => { setMoreFilters(e.target.checked); draw(); };
  $('#res', box).onchange = e => { F.reserved = e.target.checked; draw(); };
  $('#ver', box).onchange = e => { F.verified = e.target.checked; draw(); };
  $$('[data-clear]', filters).forEach(b => (b.onclick = clear));
  $('[data-show]', filters).onclick = () => filters.classList.remove('open');
  $('[data-close]', filters).onclick = () => filters.classList.remove('open');
  $('#q', box).oninput = e => { F.q = e.target.value; draw(); };
  $('#sort', box).onchange = e => { F.sort = e.target.value; draw(); };
  $$('#quick .pill', box).forEach(b => (b.onclick = () => {
    const v = b.dataset.v;
    if (!v) F.species = [];
    else F.species = F.species.includes(v) ? F.species.filter(x => x !== v) : [...F.species, v];
    const opts = breedOptions();
    F.breeds = F.breeds.filter(x => opts.includes(x));
    breedCombo.setOptions(opts);
    breedCombo.value = F.breeds;
    draw();
  }));
  $('#open-filters', box).onclick = () => filters.classList.add('open');
  draw();
}