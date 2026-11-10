// Gyvūno profilis, prieglaudos puslapis, išsaugoti gyvūnai, pranešimas apie skelbimą
import { api } from '../api.js?v=11';
import { esc, $, $$, icon, go, back, toast, ageText, breedText, statusChip, ownerName, isVerified, photo, heartBtn, bindHearts,
  favs, requireLogin, confirmDialog, initial, petCard, isAdmin, plural } from '../app.js?v=11';
import { REPORT_REASONS } from '../data.js?v=11';

export async function render(box, id) {
  const p = await api.getPet(id);
  if (!p) { box.innerHTML = `<div class="empty"><h2>Skelbimas nerastas</h2><p>Galbūt jis buvo ištrintas arba paslėptas.</p><a class="btn primary" href="#/">Į paiešką</a></div>`; return; }
  const u = api.user;
  const mine = u && p.owner_id === u.id;
  const photos = p.photos?.length ? p.photos : [photo(p)];
  const ver = isVerified(p);
  const myReq = u && !mine ? (await api.myRequests()).find(r => r.pet_id === p.id && r.status !== 'Atšaukta') : null;
  const shelterOwner = p.owner?.role === 'shelter';
  const ownerKind = shelterOwner ? 'prieglauda' : 'globėjas';

  let action;
  if (mine) action = `
    <a class="btn primary block" href="#/skelbimai/${p.id}/redaguoti">${icon('edit')} Redaguoti skelbimą</a>
    <a class="btn ghost block" href="#/skelbimai/${p.id}/kandidatai">Kandidatai</a>`;
  else if (p.status === 'Rado namus') action = `<div class="notice ok">${esc(p.name)} jau rado namus</div>`;
  else if (myReq) action = `<a class="btn ghost block" href="#/zinutes/${myReq.id}">${myReq.queued ? 'Esi eilėje' : 'Užklausa išsiųsta'} – žiūrėti žinutes</a>`;
  else if (p.status === 'Rezervuotas' && !p.queue_open) action = `<button class="btn block" disabled>Rezervuotas – eilė uždaryta</button>
    <p class="sub center small">Šis gyvūnas jau turi būsimus šeimininkus.</p>`;
  else if (p.status === 'Rezervuotas') action = `<button class="btn primary block" id="adopt">Stoti į eilę</button>
    <p class="sub center small">Gyvūnas rezervuotas. Jei su dabartiniais kandidatais nepavyks, ${ownerKind} susisieks su eilėje esančiais.</p>`;
  else action = `<button class="btn primary block" id="adopt">Noriu priglausti</button>
    <p class="sub center small">${shelterOwner ? 'Užpildysi trumpą klausimyną' : 'Parašysi trumpą žinutę'}, ${ownerKind} atsakys žinutėse.</p>`;

  box.innerHTML = `
    <button class="back" data-back>${icon('back')} Atgal</button>
    ${p.hidden ? `<div class="notice err">Šį skelbimą paslėpė administratorius – kiti vartotojai jo nemato.</div>` : ''}
    ${p.archived ? `<div class="notice">Skelbimas archyvuotas – kiti vartotojai jo nemato.</div>` : ''}
    ${p.review_status === 'pending' ? `<div class="notice">Skelbimas laukia administratoriaus patikrinimo, todėl kol kas nerodomas kitiems. Fauner gyvūnai atiduodami tik nemokamai – jei aprašyme minima kaina ar pinigai, pataisyk jį.${p.review_reason ? ` <span class="sub">(${esc(p.review_reason)})</span>` : ''}</div>` : ''}
    ${p.review_status === 'rejected' ? `<div class="notice err">Administratorius atmetė skelbimą: ${esc(p.review_reason)}</div>` : ''}
    <div class="pet-layout">
      <div class="gallery">
        <div class="main-photo">
          <div class="slides" id="slides">${photos.map((ph, i) => `<button class="slide" data-i="${i}" aria-label="Didinti nuotrauką"><img src="${esc(ph)}" alt="${esc(p.name)}"></button>`).join('')}</div>
          <button class="icon-btn float left only-mobile" data-back aria-label="Atgal">${icon('back')}</button>
          <div class="float right row gap-s">
            <button class="icon-btn" id="share" aria-label="Dalintis">${icon('share')}</button>
            ${heartBtn(p, 'static')}
          </div>
          ${photos.length > 1 ? `<div class="dots">${photos.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
        </div>
        ${photos.length > 1 ? `<div class="thumbs">${photos.map((ph, i) => `<button class="thumb ${i ? '' : 'on'}" data-i="${i}"><img src="${esc(ph)}" alt=""></button>`).join('')}</div>` : ''}
      </div>
      <div class="pet-info panel">
        <div class="row between"><h1>${esc(p.name)}, ${ageText(p.birth_date)}</h1>${statusChip(p.status)}</div>
        <p class="sub row gap-s">${icon('pin', 'sm')} ${esc(p.city)} · ${esc(p.species.toLowerCase())} · ${esc(p.sex.toLowerCase())}</p>
        <a class="org" href="#/${p.owner?.role === 'shelter' ? 'prieglauda' : 'vartotojas'}/${esc(p.owner_id || '')}">
          ${p.owner?.avatar_url ? `<img class="avatar soft" src="${esc(p.owner.avatar_url)}" alt="">` : `<span class="avatar soft">${esc(initial(ownerName(p)))}</span>`}
          <div class="grow"><b>${esc(ownerName(p))}</b>
            ${ver ? `<span class="ok">${icon('shield', 'sm')} Patvirtinta prieglauda</span>` : `<span class="sub">${p.owner?.role === 'shelter' ? 'Prieglauda' : 'Privatus globėjas'}</span>`}
          </div>${icon('next', 'sm sub')}
        </a>
        <div class="facts">
          <div><span class="sub">Amžius</span><b>${ageText(p.birth_date)}</b></div>
          <div><span class="sub">Veislė</span><b>${esc(breedText(p))}</b></div>
          <div><span class="sub">Lytis</span><b>${esc(p.sex)}</b></div>
        </div>
        ${p.health?.length ? `<h3>Sveikata</h3><div class="checks">${p.health.map(h => `<span>${icon('check', 'sm ok')} ${esc(h)}</span>`).join('')}</div>` : ''}
        ${p.traits?.length ? `<h3>Charakteris</h3><div class="pills">${p.traits.map(t => `<span class="pill static">${esc(t)}</span>`).join('')}</div>` : ''}
        <h3>Apie gyvūną</h3>
        <p class="desc">${esc(p.description || 'Aprašymo nėra.')}</p>
        <div class="actions">
          ${action}
          ${isAdmin() && !mine ? `<a class="btn ghost block" href="#/skelbimai/${p.id}/redaguoti">${icon('edit')} Redaguoti (admin)</a>` : ''}
          ${mine ? '' : `<button class="link center report" id="report">${icon('flag', 'sm')} Pranešti apie skelbimą</button>`}
        </div>
      </div>
    </div>`;

  bindHearts(box);
  $$('[data-back]', box).forEach(b => b.onclick = () => back(''));
  const slides = $('#slides', box);
  const setDot = i => {
    $$('.dots i', box).forEach((d, k) => d.classList.toggle('on', k === i));
    $$('.thumb', box).forEach((t, k) => t.classList.toggle('on', k === i));
  };
  slides.addEventListener('scroll', () => setDot(Math.round(slides.scrollLeft / slides.clientWidth)), { passive: true });
  $$('.thumb', box).forEach(t => t.onclick = () => { slides.scrollTo({ left: slides.clientWidth * t.dataset.i, behavior: 'smooth' }); setDot(Number(t.dataset.i)); });
  $$('.slide', box).forEach(s => s.onclick = () => lightbox(photos, Number(s.dataset.i)));
  $('#share', box).onclick = () => share(p);
  const adopt = $('#adopt', box);
  if (adopt) adopt.onclick = () => { if (requireLogin('Prisijunk, kad galėtum išsiųsti užklausą')) go(`gyvunas/${p.id}/uzklausa`); };
  const rep = $('#report', box);
  if (rep) rep.onclick = () => { if (requireLogin('Prisijunk, kad galėtum pranešti')) reportSheet(p); };
}

async function share(p) {
  const url = location.href.split('#')[0] + '#/gyvunas/' + p.id;
  const text = `${p.name} ieško namų – Fauner`;
  if (navigator.share) { try { await navigator.share({ title: text, url }); } catch { } return; }
  try { await navigator.clipboard.writeText(url); toast('Nuoroda nukopijuota'); }
  catch { prompt('Nukopijuok nuorodą:', url); }
}

function lightbox(photos, start) {
  const d = document.createElement('div');
  d.className = 'lightbox';
  d.innerHTML = `<button class="icon-btn lb-close" aria-label="Uždaryti">${icon('x')}</button>
    <div class="lb-slides">${photos.map(ph => `<div class="lb-slide"><img src="${esc(ph)}" alt=""></div>`).join('')}</div>
    ${photos.length > 1 ? `<button class="icon-btn lb-prev" aria-label="Ankstesnė">${icon('back')}</button><button class="icon-btn lb-next" aria-label="Kita">${icon('next')}</button>` : ''}`;
  document.body.appendChild(d);
  const s = $('.lb-slides', d);
  s.scrollLeft = s.clientWidth * start;
  const move = k => s.scrollBy({ left: k * s.clientWidth, behavior: 'smooth' });
  const close = () => { d.remove(); document.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); };
  document.addEventListener('keydown', key);
  $('.lb-close', d).onclick = close;
  $('.lb-prev', d) && ($('.lb-prev', d).onclick = () => move(-1));
  $('.lb-next', d) && ($('.lb-next', d).onclick = () => move(1));
}

function reportSheet(p) {
  const d = document.createElement('div');
  d.className = 'overlay sheet-wrap';
  d.innerHTML = `
    <form class="sheet">
      <div class="grip"></div>
      <h2>Pranešti apie skelbimą</h2>
      <p class="sub">Pranešimas anonimiškas. Administratorius jį peržiūrės per 24 val.</p>
      ${REPORT_REASONS.map((r, i) => `<label class="radio"><input type="radio" name="reason" value="${esc(r)}" ${i ? '' : 'checked'}><span>${esc(r)}</span></label>`).join('')}
      <textarea class="input" name="details" rows="3" placeholder="Papildoma informacija (nebūtina)"></textarea>
      <button class="btn danger block" type="submit">Siųsti pranešimą</button>
      <button class="link center" type="button" data-cancel>Atšaukti</button>
    </form>`;
  const close = () => d.remove();
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-cancel]')) close(); });
  $('form', d).onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    try { await api.createReport(p.id, f.get('reason'), f.get('details')); close(); toast('Ačiū! Pranešimas išsiųstas administratoriui.'); }
    catch (err) { toast(err.message, 'err'); }
  };
  document.body.appendChild(d);
}

// Prieglaudos / globėjo puslapis su visais jo gyvūnais
export async function renderShelter(box, id) {
  const [prof, pets] = await Promise.all([api.getProfile(id), api.petsByOwner(id)]);
  if (!prof) { box.innerHTML = `<div class="empty"><h2>Puslapis nerastas</h2><a class="btn primary" href="#/">Į paiešką</a></div>`; return; }
  const shelter = prof.role === 'shelter';
  const name = prof.shelter_name || prof.name;
  const active = pets.filter(p => p.status !== 'Rado namus');
  const found = pets.filter(p => p.status === 'Rado namus');
  box.innerHTML = `
    <button class="back" data-back>${icon('back')} Atgal</button>
    <div class="shelter-head panel">
      ${prof.avatar_url ? `<img class="avatar big" src="${esc(prof.avatar_url)}" alt="">` : `<span class="avatar big">${esc(initial(name))}</span>`}
      <div class="grow">
        <h1>${esc(name)}</h1>
        <p class="sub">${shelter ? (prof.verified ? `<span class="ok">${icon('shield', 'sm')} Patvirtinta prieglauda</span>` : 'Prieglauda') : 'Privatus globėjas'}${prof.city ? ' · ' + esc(prof.city) : ''}</p>
        ${prof.about ? `<p class="desc">${esc(prof.about)}</p>` : ''}
        ${shelter ? `<div class="row gap wrap contact">
          ${prof.address ? `<span class="row gap-s">${icon('pin', 'sm')} ${esc(prof.address)}</span>` : ''}
          ${prof.phone ? `<a class="row gap-s" href="tel:${esc(prof.phone)}">${icon('phone', 'sm')} ${esc(prof.phone)}</a>` : ''}
          ${prof.website ? `<a class="row gap-s" href="${esc(prof.website)}" target="_blank" rel="noopener">${icon('globe', 'sm')} Svetainė</a>` : ''}
        </div>` : ''}
      </div>
    </div>
    <h2>Laukia namų (${active.length})</h2>
    ${active.length ? `<div class="grid">${active.map(petCard).join('')}</div>` : '<p class="sub">Šiuo metu gyvūnų nėra.</p>'}
    ${found.length ? `<h2>Jau rado namus (${found.length})</h2><div class="grid found">${found.map(petCard).join('')}</div>` : ''}`;
  bindHearts(box);
  $('[data-back]', box).onclick = () => back('');
}

export async function renderSaved(box) {
  if (!requireLogin('Prisijunk, kad matytum išsaugotus gyvūnus')) return;
  await favs.load();
  const pets = (await api.listPets()).filter(p => favs.ids.has(p.id));
  box.innerHTML = `
    <h1>Išsaugoti</h1>
    <p class="sub">${plural(pets.length, 'gyvūnas', 'gyvūnai', 'gyvūnų')}</p>
    ${pets.length ? `<div class="list">${pets.map(p => `
      <a class="list-item" href="#/gyvunas/${p.id}">
        <img src="${esc(photo(p))}" alt="">
        <div class="grow"><b>${esc(p.name)}, ${ageText(p.birth_date)}</b><span class="sub">${esc(breedText(p))} · ${esc(p.city)}</span>${statusChip(p.status)}</div>
        ${heartBtn(p, 'static plain')}
      </a>`).join('')}</div>
      <p class="sub small">Palygink išsaugotus gyvūnus ir parašyk globėjui tiesiai iš profilio.</p>`
    : `<div class="empty"><p>Dar nieko neišsaugojai. Paspausk širdelę prie gyvūno, ir jis atsiras čia.</p><a class="btn primary" href="#/">Ieškoti gyvūnų</a></div>`}`;
  $$('[data-fav]', box).forEach(b => b.addEventListener('click', async e => {
    e.preventDefault(); e.stopPropagation();
    if (!await confirmDialog('Pašalinti iš išsaugotų?', 'Pašalinti')) return;
    favs.ids.delete(Number(b.dataset.fav));
    await api.setFavorite(Number(b.dataset.fav), false);
    b.closest('.list-item').remove();
    toast('Pašalinta iš išsaugotų');
  }));
}
