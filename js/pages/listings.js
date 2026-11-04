// Skelbimai: skydelis / mano skelbimai, naujo skelbimo forma (4 žingsniai), redagavimas (vienas puslapis), kandidatai
import { api } from '../api.js?v=10';
import { esc, $, $$, icon, go, back, toast, ageText, ageMonths, birthFrom, breedText, statusChip, photo, requireLogin,
  confirmDialog, timeAgo, initial, isAdmin, plural } from '../app.js?v=10';
import { reqChip } from './requests.js?v=10';
import { CITIES, BREEDS, SPECIES, TRAITS, HEALTH, UNKNOWN_BREED, PHONE_RE, saleWords } from '../data.js?v=10';
import { combo } from '../ui.js?v=10';

const STATUSES = ['Laukia namų', 'Rezervuotas', 'Rado namus'];
const stClass = s => s === 'Laukia namų' ? 'st-wait' : s === 'Rezervuotas' ? 'st-res' : 'st-home';

export async function renderMine(box) {
  if (!requireLogin('Prisijunk, kad matytum savo skelbimus')) return;
  const u = api.user;
  const shelter = u.role === 'shelter';
  const [pets, reqs] = await Promise.all([api.myPets(), api.incomingRequests()]);
  const fresh = id => reqs.filter(r => r.pet_id === id && r.status === 'Išsiųsta').length;
  const total = id => reqs.filter(r => r.pet_id === id && !['Atmesta', 'Atšaukta'].includes(r.status)).length;
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString();
  let tab = 'active';

  box.innerHTML = `
    <div class="row between page-head">
      <h1>${shelter ? 'Prieglaudos skydelis' : 'Mano skelbimai'}</h1>
      <a class="btn primary" href="#/skelbimai/naujas">${icon('plus')} Naujas skelbimas</a>
    </div>
    ${!shelter && !isAdmin() ? `<p class="sub">Atiduodi augintinį? Įkelk skelbimą ir pats išsirink naujus šeimininkus. Atstovauji prieglaudai? <a class="link" href="#/prieglaudos-paraiska">Pateik paraišką</a>.</p>` : ''}
    <div class="stats">
      <div class="stat"><b>${pets.filter(p => !p.archived).length}</b><span>Aktyvūs skelbimai</span></div>
      <div class="stat"><b>${pets.filter(p => !p.archived && p.status === 'Laukia namų').length}</b><span>Laukia namų</span></div>
      <div class="stat"><b class="accent">${reqs.filter(r => r.status === 'Išsiųsta').length}</b><span>Naujos užklausos</span></div>
      <div class="stat"><b>${pets.filter(p => p.status === 'Rado namus' && p.updated_at > monthAgo).length}</b><span>Rado namus per 30 d.</span></div>
    </div>
    <div class="tabs-seg"><button class="on" data-t="active">Aktyvūs (${pets.filter(p => !p.archived).length})</button><button data-t="archive">Archyvas (${pets.filter(p => p.archived).length})</button></div>
    <div id="list"></div>
    <div class="row between"><h2>Gautos užklausos</h2>${reqs.length > 5 ? '<button class="link" id="all-req">Rodyti visas</button>' : ''}</div>
    <div class="list" id="reqs"></div>`;

  function drawReqs(all) {
    const list = reqs.slice().reverse().slice(0, all ? undefined : 5);
    $('#reqs', box).innerHTML = list.length ? list.map(r => `
      <a class="list-item" href="#/zinutes/${r.id}">
        <span class="avatar soft">${esc(initial(r.full_name))}</span>
        <div class="grow"><b>${esc(r.full_name)}</b><span class="sub">Dėl: ${esc(r.pet.name)} · ${esc(r.city || '')} · ${timeAgo(r.created_at)}</span></div>
        ${reqChip(r.status, r.queued)}
      </a>`).join('') : '<p class="sub">Užklausų dar nėra.</p>';
  }

  function draw() {
    const list = pets.filter(p => tab === 'archive' ? p.archived : !p.archived);
    if (!list.length) {
      $('#list', box).innerHTML = tab === 'archive' ? '<div class="empty"><p>Archyvas tuščias.</p></div>'
        : `<div class="empty"><p>Dar neturi skelbimų. Įkelk pirmą – užtruks apie 5 minutes.</p><a class="btn primary" href="#/skelbimai/naujas">Naujas skelbimas</a></div>`;
      return;
    }
    $('#list', box).innerHTML = `<div class="pet-rows">${list.map(p => `
      <div class="pet-row panel" data-id="${p.id}">
        <a href="#/gyvunas/${p.id}" class="row gap grow min0"><img class="thumb-s" src="${esc(photo(p))}" alt="">
          <div class="min0"><b>${esc(p.name)}, ${ageText(p.birth_date)}</b><span class="sub block ellipsis">${esc(breedText(p))} · ${esc(p.city)}${p.hidden ? ' · <span class="danger-text">paslėptas admino</span>' : ''}${p.review_status === 'pending' ? ' · <span class="accent">tikrinamas</span>' : p.review_status === 'rejected' ? ' · <span class="danger-text">atmestas</span>' : ''}</span></div></a>
        <select class="status-select ${stClass(p.status)}" data-status aria-label="Statusas">${STATUSES.map(s => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <a class="req-count ${fresh(p.id) ? 'accent' : 'sub'}" href="#/skelbimai/${p.id}/kandidatai">${fresh(p.id) ? `${fresh(p.id)} naujos` : total(p.id) ? plural(total(p.id), 'užklausa', 'užklausos', 'užklausų') : 'Užklausų nėra'}</a>
        <span class="sub small hide-s">${timeAgo(p.updated_at || p.created_at)}</span>
        <div class="row-actions">
          <a class="icon-btn" href="#/skelbimai/${p.id}/redaguoti" aria-label="Redaguoti" title="Redaguoti">${icon('edit')}</a>
          ${p.archived ? `<button class="icon-btn" data-unarch aria-label="Grąžinti" title="Grąžinti iš archyvo">${icon('up')}</button>
            <button class="icon-btn" data-del aria-label="Ištrinti visam laikui" title="Ištrinti visam laikui">${icon('trash')}</button>`
          : `<button class="icon-btn" data-arch aria-label="Archyvuoti" title="Archyvuoti">${icon('archive')}</button>`}
        </div>
      </div>`).join('')}</div>`;
    $$('[data-status]', box).forEach(sel => sel.onchange = async () => {
      const id = Number(sel.closest('[data-id]').dataset.id);
      if (sel.value === 'Rado namus' && !await confirmDialog('Pažymėti, kad gyvūnas rado namus? Jis nebebus rodomas paieškoje.', 'Taip')) { sel.value = pets.find(p => p.id === id).status; return; }
      try {
        await api.updatePet(id, { status: sel.value }); pets.find(p => p.id === id).status = sel.value;
        sel.className = 'status-select ' + stClass(sel.value);
        toast('Statusas pakeistas – jis jau matomas paieškoje');
      } catch (e) { toast(e.message, 'err'); }
    });
    const setArch = async (el, v) => {
      const id = Number(el.closest('[data-id]').dataset.id);
      await api.updatePet(id, { archived: v }); pets.find(p => p.id === id).archived = v;
      toast(v ? 'Skelbimas perkeltas į archyvą' : 'Skelbimas vėl aktyvus'); draw(); updTabs();
    };
    $$('[data-arch]', box).forEach(b => b.onclick = async () => {
      if (await confirmDialog('Perkelti skelbimą į archyvą? Jis nebus rodomas paieškoje, bet užklausos ir pokalbiai išliks.', 'Archyvuoti')) setArch(b, true);
    });
    $$('[data-unarch]', box).forEach(b => b.onclick = () => setArch(b, false));
    $$('[data-del]', box).forEach(b => b.onclick = async () => {
      const row = b.closest('[data-id]'), id = Number(row.dataset.id);
      if (!await confirmDialog('Ištrinti skelbimą visam laikui? Kartu bus ištrintos visos jo užklausos ir pokalbiai. To atšaukti negalima.', 'Ištrinti', true)) return;
      try { await api.deletePet(id); pets.splice(pets.findIndex(p => p.id === id), 1); toast('Skelbimas ištrintas'); draw(); updTabs(); } catch (e) { toast(e.message, 'err'); }
    });
  }
  function updTabs() {
    $('[data-t=active]', box).textContent = `Aktyvūs (${pets.filter(p => !p.archived).length})`;
    $('[data-t=archive]', box).textContent = `Archyvas (${pets.filter(p => p.archived).length})`;
  }
  $$('[data-t]', box).forEach(b => b.onclick = () => { tab = b.dataset.t; $$('[data-t]', box).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  const all = $('#all-req', box); if (all) all.onclick = () => { drawReqs(true); all.remove(); };
  draw(); drawReqs(false);
}

// ---------- Formos dalys ----------
const pillGroup = (name, values, selected, multi) => `<div class="pills" data-group="${name}" data-multi="${multi ? 1 : 0}">${values.map(v =>
  `<button type="button" class="pill ${(multi ? selected.includes(v) : selected === v) ? 'on' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>`;

function bindPills(root) {
  $$('[data-group] .pill', root).forEach(b => b.onclick = () => {
    const g = b.parentElement;
    if (g.dataset.multi === '1') b.classList.toggle('on');
    else $$('.pill', g).forEach(x => x.classList.toggle('on', x === b));
    g.dispatchEvent(new Event('change'));
  });
}
const groupVal = (root, name) => {
  const g = $(`[data-group="${name}"]`, root); if (!g) return undefined;
  const on = $$('.pill.on', g).map(b => b.dataset.v);
  return g.dataset.multi === '1' ? on : on[0];
};

const sections = {
  photos: pet => `
    <div class="photo-grid" id="photos">
      ${pet.photos.map((ph, i) => `<div class="ph"><img src="${esc(ph)}" alt="">
        ${i === 0 ? '<span class="tag">Pagrindinė</span>' : `<button type="button" class="tag btn-tag" data-main="${i}">Padaryti pagrindine</button>`}
        <div class="ph-tools">
          ${i > 0 ? `<button type="button" class="icon-btn mini" data-left="${i}" aria-label="Kairėn">${icon('back')}</button>` : ''}
          ${i < pet.photos.length - 1 ? `<button type="button" class="icon-btn mini" data-right="${i}" aria-label="Dešinėn">${icon('next')}</button>` : ''}
          <button type="button" class="icon-btn mini" data-rm="${i}" aria-label="Pašalinti">${icon('x')}</button>
        </div></div>`).join('')}
      ${pet.photos.length < 5 ? `<label class="upload">${icon('camera')}<span>Įkelti</span><input type="file" accept="image/*" multiple hidden data-file></label>` : ''}
    </div><p class="sub small" id="up-status"></p>`,
  basic: pet => `
    <label>Vardas<input class="input" name="name" required maxlength="40" value="${esc(pet.name)}"></label>
    <label>Gyvūnas <span class="req">*</span></label>${pillGroup('species', SPECIES, pet.species)}
    <label>Veislė <span class="req">*</span></label><div id="breed"></div>
    <label class="check"><input type="checkbox" name="mixed" ${pet.mixed ? 'checked' : ''}> Mišrūnas <span class="sub small">– pažymėk, jei gyvūnas tik panašus į šią veislę</span></label>
    <label>Amžius <span class="req">*</span></label>
    <div class="two"><label class="inline">Metai<input class="input" type="number" name="years" min="0" max="30" value="${pet._y}"></label>
      <label class="inline">Mėnesiai<input class="input" type="number" name="months" min="0" max="11" value="${pet._m}"></label></div>
    <p class="sub small">Jei tiksliai nežinai – nurodyk apytiksliai. Amžius automatiškai didės laikui bėgant.</p>
    <label>Lytis <span class="req">*</span></label>${pillGroup('sex', ['Patinas', 'Patelė'], pet.sex)}
    <label>Miestas ar rajonas <span class="req">*</span></label><div id="city"></div>`,
  traits: pet => `
    <label>Charakteris <span class="opt">(nebūtina – pažymėk tik tai, kuo tikras)</span></label>${pillGroup('traits', TRAITS, pet.traits, true)}
    <label>Sveikata ir dokumentai</label>${pillGroup('health', HEALTH, pet.health, true)}`,
  desc: pet => `
    <label>Aprašymas<textarea class="input" name="description" rows="7" required maxlength="3000" placeholder="Koks yra gyvūnas, ką mėgsta, kokių namų jam reikia…">${esc(pet.description)}</textarea></label>
    <p class="sub small">Nerašyk kainos ir kontaktų – susisiekti galima per Fauner žinutes.</p>
    ${pet.id ? '' : `<label class="check free"><input type="checkbox" name="free" ${pet._free ? 'checked' : ''}> <span>Patvirtinu, kad gyvūną atiduodu <b>nemokamai</b> ir neprašysiu jokio mokesčio ar užstato</span></label>`}`,
  status: pet => `
    <label>Statusas</label>${pillGroup('status', STATUSES, pet.status)}
    <label class="check queue" ${pet.status === 'Rezervuotas' ? '' : 'hidden'}><input type="checkbox" name="queue_open" ${pet.queue_open ? 'checked' : ''}> Leisti kitiems stoti į eilę, kol gyvūnas rezervuotas</label>`,
};

function bindPhotos(root, pet, redraw) {
  const file = $('[data-file]', root);
  if (file) file.onchange = async () => {
    const files = [...file.files].slice(0, 5 - pet.photos.length);
    $('#up-status', root).textContent = `Įkeliama ${files.length} nuotr.…`;
    try { for (const f of files) pet.photos.push(await api.uploadPhoto(f)); redraw(); }
    catch (e) { $('#up-status', root).textContent = ''; toast('Nepavyko įkelti nuotraukos: ' + e.message, 'err'); }
  };
  const swap = (i, j) => { [pet.photos[i], pet.photos[j]] = [pet.photos[j], pet.photos[i]]; redraw(); };
  $$('[data-rm]', root).forEach(b => b.onclick = () => { pet.photos.splice(Number(b.dataset.rm), 1); redraw(); });
  $$('[data-left]', root).forEach(b => b.onclick = () => swap(Number(b.dataset.left), Number(b.dataset.left) - 1));
  $$('[data-right]', root).forEach(b => b.onclick = () => swap(Number(b.dataset.right), Number(b.dataset.right) + 1));
  $$('[data-main]', root).forEach(b => b.onclick = () => { const i = Number(b.dataset.main); pet.photos.unshift(pet.photos.splice(i, 1)[0]); redraw(); });
}

function bindBasic(root, pet) {
  const breedOpts = sp => [...(BREEDS[sp] || []), UNKNOWN_BREED];
  const breed = combo($('#breed', root), { options: breedOpts(pet.species), value: pet.breed, placeholder: 'Pasirink veislę', required: true, name: 'breed_req', onChange: v => { pet.breed = v; if (v === UNKNOWN_BREED) $('[name=mixed]', root).checked = true; } });
  const city = combo($('#city', root), { options: CITIES, value: pet.city, placeholder: 'Pasirink miestą ar rajoną', required: true, name: 'city_req', onChange: v => { pet.city = v; } });
  $('[data-group=species]', root).addEventListener('change', () => { pet.species = groupVal(root, 'species'); breed.setOptions(breedOpts(pet.species)); pet.breed = breed.value; });
  return { breed, city };
}

function collect(root, pet) {
  for (const k of ['species', 'sex', 'traits', 'health', 'status']) { const v = groupVal(root, k); if (v !== undefined) pet[k] = v; }
  const g = n => $(`[name=${n}]`, root);
  if (g('name')) pet.name = g('name').value.trim();
  if (g('mixed')) pet.mixed = g('mixed').checked;
  if (g('years')) { pet._y = Number(g('years').value || 0); pet._m = Number(g('months').value || 0); }
  if (g('description')) pet.description = g('description').value.trim();
  if (g('queue_open')) pet.queue_open = g('queue_open').checked;
  if (g('free')) pet._free = g('free').checked;
}

function validate(pet, step) {
  if ((!step || step === 1) && !pet.photos.length) return 'Pridėk bent vieną nuotrauką';
  if (!step || step === 2) {
    if (!pet.name) return 'Įrašyk vardą';
    if (!pet.species) return 'Pasirink gyvūno rūšį';
    if (!pet.breed) return 'Pasirink veislę (jei nežinai – „Nežinoma (mišrūnas)“)';
    if (pet._y * 12 + pet._m < 1) return 'Nurodyk amžių (bent 1 mėnesį)';
    if (pet._m > 11) return 'Mėnesių turi būti nuo 0 iki 11';
    if (!pet.sex) return 'Pasirink lytį';
    if (!pet.city) return 'Pasirink miestą ar rajoną';
  }
  if (!step || step === 4) {
    if (!pet.description) return 'Parašyk aprašymą';
    if (pet.description.length < 30) return 'Aprašymas per trumpas – parašyk bent kelis sakinius';
    if (PHONE_RE.test(pet.description) || /\S+@\S+\.\S+|https?:\/\//.test(pet.description)) return 'Aprašyme negalima nurodyti telefono, el. pašto ar nuorodų – bendraukite per Fauner žinutes';
    if (!pet.id && !pet._free) return 'Patvirtink, kad gyvūną atiduodi nemokamai';
  }
  return '';
}

const toData = pet => ({
  name: pet.name, species: pet.species, breed: pet.breed, mixed: pet.mixed, birth_date: birthFrom(pet._y, pet._m), sex: pet.sex,
  city: pet.city, description: pet.description, traits: pet.traits, health: pet.health, photos: pet.photos, status: pet.status, queue_open: pet.queue_open,
});

// „Ne pardavimui“: perspėjimas prieš išsaugant
async function saleConfirm(pet) {
  const w = saleWords(pet.name + ' ' + pet.description);
  if (!w.length) return true;
  return confirmDialog(`Skelbime rasta žodžių: „${w.join('“, „')}“. Fauner gyvūnai atiduodami tik nemokamai – jokių kainų ar mokesčių. Jei paskelbsi taip, skelbimas bus paslėptas, kol jį peržiūrės administratorius. Geriau pataisyk aprašymą. Vis tiek tęsti?`, 'Tęsti');
}

// ---------- Naujas skelbimas: 4 žingsniai ----------
export async function renderForm(box) {
  if (!requireLogin('Prisijunk, kad galėtum įkelti skelbimą')) return;
  const pet = { name: '', species: 'Šuo', breed: '', mixed: false, _y: '', _m: '', sex: '', city: api.user.city && CITIES.includes(api.user.city) ? api.user.city : '', description: '', traits: [], health: [], photos: [], status: 'Laukia namų', queue_open: true };
  let step = 1;
  const titles = ['Nuotraukos', 'Pagrindinė informacija', 'Charakteris ir sveikata', 'Aprašymas'];
  box.innerHTML = `<div class="narrow"><button class="back" data-back>${icon('back')} Naujas skelbimas</button>
    <div class="progress">${[1, 2, 3, 4].map(i => `<i data-p="${i}"></i>`).join('')}</div>
    <p class="accent small" id="step-label"></p>
    <form id="f" class="form" novalidate></form></div>`;
  $('[data-back]', box).onclick = () => back('skelbimai');
  const form = $('#f', box);
  function draw() {
    $$('[data-p]', box).forEach(i => i.classList.toggle('on', Number(i.dataset.p) <= step));
    $('#step-label', box).textContent = `${step} žingsnis iš 4 · ${titles[step - 1]}`;
    const nav = `<div class="row gap form-nav">${step > 1 ? '<button type="button" class="btn ghost" data-prev>Atgal</button>' : ''}<button class="btn primary grow" type="submit">${step < 4 ? 'Toliau' : 'Paskelbti'}</button></div>`;
    const head = ['<h2>Pridėk nuotraukų</h2><p class="sub">Iki 5 nuotraukų. Pirmoji bus pagrindinė – rinkis šviesią, kur gerai matosi akys.</p>', '<h2>Pagrindinė informacija</h2>', '<h2>Charakteris ir sveikata</h2><p class="sub">Pažymėk, kas tinka. Tai padės žmonėms rasti tinkamą gyvūną.</p>', '<h2>Aprašymas</h2>'][step - 1];
    form.innerHTML = head + [sections.photos, sections.basic, sections.traits, sections.desc][step - 1](pet)
      + (step === 1 ? '<div class="notice">Skelbimą užpildysi per maždaug 5 minutes. Vėliau jį galėsi redaguoti, archyvuoti ar ištrinti.</div>' : '')
      + (step === 4 ? `<div class="preview">${pet.photos[0] ? `<img src="${esc(pet.photos[0])}" alt="">` : ''}<div><b>${esc(pet.name)}, ${ageText(birthFrom(pet._y, pet._m))}</b><span class="sub">${esc(breedText(pet))} · ${esc(pet.city)}</span></div></div>` : '') + nav;
    bindPills(form);
    if (step === 1) bindPhotos(form, pet, draw);
    if (step === 2) bindBasic(form, pet);
    const prev = $('[data-prev]', form); if (prev) prev.onclick = () => { collect(form, pet); step--; draw(); };
  }
  form.onsubmit = async e => {
    e.preventDefault();
    collect(form, pet);
    const err = validate(pet, step);
    if (err) { toast(err, 'err'); return; }
    if (step < 4) { step++; draw(); window.scrollTo(0, 0); return; }
    if (!await saleConfirm(pet)) return;
    const btn = e.submitter; btn.disabled = true;
    try { const saved = await api.createPet(toData(pet)); toast('Skelbimas paskelbtas!'); go(`gyvunas/${saved.id}`); }
    catch (er) { btn.disabled = false; toast(er.message, 'err'); }
  };
  draw();
}

// ---------- Redagavimas: viskas viename puslapyje ----------
export async function renderEdit(box, id) {
  if (!requireLogin()) return;
  const p = await api.getPet(id);
  if (!p || (p.owner_id !== api.user.id && !isAdmin())) { box.innerHTML = `<div class="empty"><h2>Neturite teisės redaguoti šio skelbimo</h2></div>`; return; }
  const m = ageMonths(p.birth_date);
  const pet = { ...p, _y: Math.floor(m / 12), _m: m % 12 };
  box.innerHTML = `<div class="narrow"><button class="back" data-back>${icon('back')} Redaguoti skelbimą</button>
    ${p.owner_id !== api.user.id ? `<div class="notice">Redaguoji kito vartotojo skelbimą kaip administratorius.</div>` : ''}
    <form id="f" class="form" novalidate></form></div>`;
  $('[data-back]', box).onclick = () => back(`gyvunas/${id}`);
  const form = $('#f', box);
  function draw() {
    if (form.innerHTML) collect(form, pet);
    form.innerHTML = `
      <section class="panel"><h2>Nuotraukos</h2>${sections.photos(pet)}</section>
      <section class="panel"><h2>Statusas</h2>${sections.status(pet)}</section>
      <section class="panel"><h2>Pagrindinė informacija</h2>${sections.basic(pet)}</section>
      <section class="panel"><h2>Charakteris ir sveikata</h2>${sections.traits(pet)}</section>
      <section class="panel"><h2>Aprašymas</h2>${sections.desc(pet)}</section>
      <div class="sticky-save"><button class="btn primary block" type="submit">Išsaugoti pakeitimus</button></div>`;
    bindPills(form); bindPhotos(form, pet, draw); bindBasic(form, pet);
    $('[data-group=status]', form).addEventListener('change', () => { $('.queue', form).hidden = groupVal(form, 'status') !== 'Rezervuotas'; });
  }
  form.onsubmit = async e => {
    e.preventDefault();
    collect(form, pet);
    const err = validate(pet);
    if (err) { toast(err, 'err'); return; }
    if (!await saleConfirm(pet)) return;
    const btn = e.submitter; btn.disabled = true;
    const data = toData(pet);
    if (ageMonths(p.birth_date) === pet._y * 12 + pet._m) data.birth_date = p.birth_date; // amžius nekeistas – paliekam tikslią datą
    try { await api.updatePet(p.id, data); toast('Pakeitimai išsaugoti'); go(`gyvunas/${p.id}`); }
    catch (er) { btn.disabled = false; toast(er.message, 'err'); }
  };
  draw();
}

// ---------- Kandidatai ----------
export async function renderCandidates(box, id) {
  if (!requireLogin()) return;
  const p = await api.getPet(id);
  if (!p || p.owner_id !== api.user.id) { box.innerHTML = `<div class="empty"><h2>Skelbimas nerastas</h2></div>`; return; }
  const reqs = (await api.incomingRequests()).filter(r => r.pet_id === p.id);
  const active = reqs.filter(r => !['Atmesta', 'Atšaukta'].includes(r.status));
  const closed = reqs.filter(r => ['Atmesta', 'Atšaukta'].includes(r.status));
  const card = (r, i) => `
    <div class="panel cand">
      <div class="row between"><div class="row gap-s"><span class="avatar soft">${esc(initial(r.full_name))}</span><div><b>${i != null ? `${i + 1}. ` : ''}${esc(r.full_name)}</b><span class="sub block">${esc(r.city || '')} · ${timeAgo(r.created_at)}</span></div></div>${reqChip(r.status, r.queued)}</div>
      <div class="pills"><span class="pill static">${esc(r.housing || '—')}</span><span class="pill static">${r.has_pets ? 'Turi kitų gyvūnų' : 'Be kitų gyvūnų'}</span>${r.phone ? `<span class="pill static">${esc(r.phone)}</span>` : ''}</div>
      <p class="quote">„${esc(r.motivation)}“</p>
      <div class="row gap"><a class="btn ghost grow" href="#/zinutes/${r.id}">Rašyti</a>
      ${['Atmesta', 'Atšaukta'].includes(r.status) ? '' : r.status !== 'Pasirinktas' ? `<button class="btn primary grow" data-pick="${r.id}">Pasirinkti</button>` : `<span class="chip st-wait">Pasirinktas</span>`}</div>
    </div>`;
  box.innerHTML = `
    <div class="narrow">
      <button class="back" data-back>${icon('back')} Atgal</button>
      <div class="mini"><img src="${esc(photo(p))}" alt=""><div class="grow"><b>${esc(p.name)}, ${ageText(p.birth_date)}</b><span class="sub">${p.archived ? 'Archyvuotas' : p.hidden ? 'Paslėptas administratoriaus' : 'Skelbimas aktyvus'} · ${plural(active.length, 'kandidatas', 'kandidatai', 'kandidatų')}</span></div>${statusChip(p.status)}</div>
      ${p.status === 'Rezervuotas' ? `<label class="switch panel tight"><span>Leisti kitiems stoti į eilę</span><input type="checkbox" id="queue" ${p.queue_open ? 'checked' : ''}><i></i></label>` : ''}
      <h2>Kandidatai</h2>
      <p class="sub small">Surikiuota pagal tai, kas parašė pirmas.</p>
      ${active.length ? active.map((r, i) => card(r, i)).join('') : `<div class="empty"><p>Kol kas aktyvių kandidatų nėra.</p></div>`}
      ${p.status !== 'Rado namus' ? `<button class="btn dark block" id="found">Pažymėti „Rado namus“</button>` : `<div class="notice ok">${esc(p.name)} rado namus</div>`}
      ${closed.length ? `<details class="closed"><summary class="sub">Atmesti ir atšaukti (${closed.length})</summary>${closed.map(r => card(r)).join('')}</details>` : ''}
    </div>`;
  $('[data-back]', box).onclick = () => back('skelbimai');
  const q = $('#queue', box);
  if (q) q.onchange = async () => { await api.updatePet(p.id, { queue_open: q.checked }); toast(q.checked ? 'Eilė atidaryta' : 'Eilė uždaryta'); };
  $$('[data-pick]', box).forEach(b => b.onclick = async () => {
    const rid = Number(b.dataset.pick);
    await api.updateRequest(rid, { status: 'Pasirinktas' });
    await api.sendMessage(rid, `${p.owner?.shelter_name || p.owner?.name || 'Globėjas'} pasirinko tave būsimu šeimininku!`, 'system');
    if (p.status === 'Laukia namų') await api.updatePet(p.id, { status: 'Rezervuotas' });
    toast('Kandidatas pasirinktas, gyvūnas pažymėtas kaip rezervuotas');
    renderCandidates(box, id);
  });
  const found = $('#found', box);
  if (found) found.onclick = async () => {
    if (!await confirmDialog(`Pažymėti, kad ${p.name} rado namus? Jis nebebus rodomas paieškoje.`, 'Taip, rado namus')) return;
    await api.updatePet(p.id, { status: 'Rado namus' });
    toast(`${p.name} rado namus!`);
    renderCandidates(box, id);
  };
}
