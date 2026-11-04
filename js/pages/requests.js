// Užklausa priglausti, žinutės ir pokalbis
import { api } from '../api.js?v=10';
import { esc, $, $$, icon, go, back, toast, ageText, breedText, ownerName, photo, requireLogin, timeAgo, confirmDialog, after, unread } from '../app.js?v=10';

const REQ_CLASS = { 'Išsiųsta': 'st-gray', 'Peržiūrėta': 'st-res', 'Pakviestas susitikti': 'st-wait', 'Pasirinktas': 'st-wait', 'Atmesta': 'st-red', 'Atšaukta': 'st-gray' };
export const reqChip = (s, queued) => `<span class="chip ${REQ_CLASS[s] || ''}">${esc(queued && ['Išsiųsta', 'Peržiūrėta'].includes(s) ? 'Eilėje' : s)}</span>`;

const petMini = p => `
  <div class="mini">
    <img src="${esc(photo(p))}" alt="">
    <div><b>${esc(p.name)}, ${ageText(p.birth_date)}</b><span class="sub">${esc(breedText(p))} · ${esc(ownerName(p))} · ${esc(p.city)}</span></div>
  </div>`;

export async function renderForm(box, petId) {
  if (!requireLogin('Prisijunk, kad galėtum išsiųsti užklausą')) return;
  const p = await api.getPet(petId);
  if (!p) { box.innerHTML = `<div class="empty"><h2>Skelbimas nerastas</h2></div>`; return; }
  const u = api.user;
  if (p.owner_id === u.id) { go(`gyvunas/${p.id}`); return; }
  const existing = (await api.myRequests()).find(r => r.pet_id === p.id && r.status !== 'Atšaukta');
  if (existing) { go(`zinutes/${existing.id}`); return; }
  if (p.status === 'Rado namus' || (p.status === 'Rezervuotas' && !p.queue_open)) { go(`gyvunas/${p.id}`); return; }
  const queued = p.status === 'Rezervuotas';
  const who = p.owner?.role === 'shelter' ? 'prieglaudai' : 'globėjui';
  box.innerHTML = `
    <div class="narrow">
      <button class="back" data-back>${icon('back')} ${queued ? 'Stoti į eilę' : 'Užklausa priglausti'}</button>
      ${petMini(p)}
      ${queued ? `<div class="notice">Gyvūnas šiuo metu rezervuotas. Užklausa bus įrašyta į eilę – jei nepavyks su dabartiniais kandidatais, ${p.owner?.role === 'shelter' ? 'prieglauda' : 'globėjas'} susisieks su tavimi.</div>` : ''}
      <form class="form" id="f">
        <label>Vardas, pavardė<input class="input" name="full_name" required value="${esc(u.name)}"></label>
        <div class="two">
          <label>Telefonas <span class="opt">(nebūtina)</span><input class="input" name="phone" type="tel" placeholder="+370 6xx xxxxx"></label>
          <label>Miestas<input class="input" name="city" required value="${esc(u.city || '')}"></label>
        </div>
        <label>Kur gyveni?</label>
        <div class="pills" data-radio="housing">${['Butas', 'Namas su kiemu', 'Kita'].map((v, i) => `<button type="button" class="pill ${i ? '' : 'on'}" data-v="${v}">${v}</button>`).join('')}</div>
        <label>Ar turi kitų gyvūnų?</label>
        <div class="pills" data-radio="has_pets">${['Taip', 'Ne'].map(v => `<button type="button" class="pill ${v === 'Ne' ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
        <label>Kodėl nori jį priglausti?<textarea class="input" name="motivation" rows="4" required placeholder="Papasakok apie save, savo kasdienybę ir patirtį su gyvūnais"></textarea></label>
        <p class="sub small">Klausimynas padeda ${who} greičiau atsakyti. Tavo kontaktai matomi tik ${p.owner?.role === 'shelter' ? 'šiai prieglaudai' : 'šiam globėjui'}.</p>
        <button class="btn primary block" type="submit">${queued ? 'Stoti į eilę' : 'Siųsti užklausą'}</button>
      </form>
    </div>`;
  $('[data-back]', box).onclick = () => back(`gyvunas/${p.id}`);
  $$('[data-radio]', box).forEach(g => $$('.pill', g).forEach(b => b.onclick = () => { $$('.pill', g).forEach(x => x.classList.toggle('on', x === b)); }));
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const btn = e.submitter; btn.disabled = true;
    try {
      const r = await api.createRequest({
        pet_id: p.id, full_name: f.get('full_name'), phone: f.get('phone'), city: f.get('city'), queued,
        housing: $('[data-radio=housing] .on', box).dataset.v, has_pets: $('[data-radio=has_pets] .on', box).dataset.v === 'Taip',
        motivation: f.get('motivation'),
      });
      go(`gyvunas/${p.id}/issiusta/${r.id}`);
    } catch (err) { btn.disabled = false; toast(err.message, 'err'); }
  };
}

export async function renderSent(box, petId, reqId) {
  const [p, r] = await Promise.all([api.getPet(petId), api.getRequest(reqId)]);
  box.innerHTML = `
    <div class="narrow center-col">
      <div class="big-check">${icon('check')}</div>
      <h1>${r?.queued ? 'Įrašyta į eilę!' : 'Užklausa išsiųsta!'}</h1>
      <p class="sub">${esc(p ? ownerName(p) : 'Globėjas')} gavo tavo užklausą. Atsakymą gausi žinutėse – dažniausiai per 1–2 dienas.</p>
      ${p ? petMini(p) : ''}
      <a class="btn primary block" href="#/zinutes/${reqId}">Žiūrėti žinutes</a>
      <a class="btn ghost block" href="#/">Grįžti į paiešką</a>
    </div>`;
}

export async function renderInbox(box) {
  if (!requireLogin('Prisijunk, kad matytum žinutes')) return;
  const u = api.user;
  const [mine, incoming] = await Promise.all([api.myRequests(), api.incomingRequests()]);
  const all = [...incoming.map(r => ({ ...r, _in: true })), ...mine];
  const last = await api.lastMessages(all.map(r => r.id));
  const ts = r => last[r.id]?.created_at || r.created_at;
  all.sort((a, b) => ts(b).localeCompare(ts(a)));
  const isUnread = r => {
    const lm = last[r.id], readAt = r._in ? r.owner_read_at : r.seeker_read_at;
    return (lm && lm.sender_id !== u.id && lm.created_at > readAt) || (r._in && r.status === 'Išsiųsta' && r.created_at > readAt);
  };
  const item = r => {
    const lm = last[r.id];
    const who = r._in ? r.seeker?.name || r.full_name : ownerName(r.pet);
    const preview = lm ? (lm.kind === 'system' ? lm.body : (lm.sender_id === u.id ? 'Tu: ' : '') + lm.body) : r._in ? 'Nauja užklausa' : 'Užklausa išsiųsta';
    return `
      <a class="list-item ${isUnread(r) ? 'unread' : ''}" href="#/zinutes/${r.id}">
        <img class="round" src="${esc(photo(r.pet))}" alt="">
        <div class="grow">
          <div class="row between"><b>${esc(who)}</b><span class="sub small">${timeAgo(ts(r))}</span></div>
          <span class="sub ellipsis">Dėl: ${esc(r.pet.name)} · ${esc(preview)}</span>
          <div class="row gap-s">${r._in ? '<span class="chip st-new">Gauta</span>' : ''}${reqChip(r.status, r.queued)}${isUnread(r) ? '<span class="dot"></span>' : ''}</div>
        </div>
      </a>`;
  };
  const arch = r => ['Atmesta', 'Atšaukta'].includes(r.status) || r.pet.status === 'Rado namus';
  box.innerHTML = `
    <h1>Žinutės</h1>
    <div class="tabs-seg"><button class="on" data-t="active">Aktyvios (${all.filter(r => !arch(r)).length})</button><button data-t="archive">Archyvas (${all.filter(arch).length})</button></div>
    <div class="list" id="list"></div>`;
  const draw = t => {
    const list = all.filter(r => t === 'archive' ? arch(r) : !arch(r));
    $('#list', box).innerHTML = list.length ? list.map(item).join('')
      : `<div class="empty"><p>${t === 'archive' ? 'Archyvas tuščias.' : 'Kol kas žinučių nėra. Rask gyvūną ir išsiųsk užklausą.'}</p>${t === 'archive' ? '' : '<a class="btn primary" href="#/">Ieškoti gyvūnų</a>'}</div>`;
  };
  $$('[data-t]', box).forEach(b => b.onclick = () => { $$('[data-t]', box).forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.t); });
  draw('active');
}

export async function renderChat(box, reqId) {
  if (!requireLogin()) return;
  const u = api.user;
  let r = await api.getRequest(reqId);
  if (!r) { box.innerHTML = `<div class="empty"><h2>Pokalbis nerastas</h2><a class="btn ghost" href="#/zinutes">Į žinutes</a></div>`; return; }
  const isOwner = r.pet.owner_id === u.id;
  if (isOwner && r.status === 'Išsiųsta') r = await api.updateRequest(r.id, { status: 'Peržiūrėta' });
  await api.markRead(r); unread.refresh();
  const other = isOwner ? (r.seeker?.name || r.full_name) : ownerName(r.pet);
  const closed = ['Atmesta', 'Atšaukta'].includes(r.status);

  box.innerHTML = `
    <div class="chat">
      <div class="chat-head">
        <a class="icon-btn" href="#/zinutes" aria-label="Atgal">${icon('back')}</a>
        <img class="round" src="${esc(photo(r.pet))}" alt="">
        <div class="grow"><b>${esc(other)}</b><span class="sub">Dėl: ${esc(r.pet.name)}, ${ageText(r.pet.birth_date)}</span></div>
        <a class="link small" href="#/gyvunas/${r.pet.id}">Gyvūno profilis</a>
      </div>
      <div class="chat-info" id="info"></div>
      <div class="msgs" id="msgs"></div>
      ${closed ? `<p class="sub center small">Pokalbis uždarytas – užklausa ${r.status === 'Atšaukta' ? 'atšaukta' : 'atmesta'}.</p>` : `
      <form class="composer" id="send">
        <input class="input" name="body" placeholder="Rašyk žinutę…" autocomplete="off" required maxlength="2000">
        <button class="icon-btn primary" aria-label="Siųsti">${icon('send')}</button>
      </form>`}
    </div>`;

  const sys = async text => api.sendMessage(r.id, text, 'system');
  function drawInfo() {
    const q = `<div class="q-sum"><span>${esc(r.housing || '—')}</span><span>${r.has_pets ? 'Turi kitų gyvūnų' : 'Be kitų gyvūnų'}</span><span>${esc(r.city || '')}</span></div>
      <p class="quote">„${esc(r.motivation)}“</p>`;
    $('#info', box).innerHTML = isOwner ? `
      <details class="panel tight" ${closed ? '' : 'open'}>
        <summary class="row between"><b>${esc(r.full_name)}${r.phone ? ' · ' + esc(r.phone) : ''}</b>${reqChip(r.status, r.queued)}</summary>
        ${q}
        ${closed ? '' : `<div class="row gap wrap">
          ${!['Pakviestas susitikti', 'Pasirinktas'].includes(r.status) ? `<button class="btn ghost sm" data-st="Pakviestas susitikti">Pakviesti susitikti</button>` : ''}
          ${r.status !== 'Pasirinktas' ? `<button class="btn primary sm" data-st="Pasirinktas">Pasirinkti</button>` : ''}
          ${r.status === 'Pasirinktas' && r.pet.status !== 'Rado namus' ? `<button class="btn dark sm" data-found>Pažymėti „Rado namus“</button>` : ''}
          <button class="btn ghost sm danger-text" data-st="Atmesta">Atmesti</button>
        </div>`}
      </details>` : `
      <div class="row between status-line"><span class="sub">Užklausos būsena</span>${reqChip(r.status, r.queued)}</div>
      ${!closed && r.status !== 'Pasirinktas' ? `<button class="link small" data-cancel>Atšaukti užklausą</button>` : ''}`;
    $$('[data-st]', box).forEach(b => b.onclick = async () => {
      const st = b.dataset.st;
      if (st === 'Atmesta' && !await confirmDialog('Atmesti šią užklausą? Kandidatas gaus pranešimą.', 'Atmesti', true)) return;
      r = await api.updateRequest(r.id, { status: st });
      if (st === 'Pasirinktas' && r.pet.status === 'Laukia namų') { await api.updatePet(r.pet.id, { status: 'Rezervuotas' }); r.pet.status = 'Rezervuotas'; }
      await sys({ 'Pakviestas susitikti': `${ownerName(r.pet)} pakvietė susipažinti su gyvūnu`, 'Pasirinktas': `${ownerName(r.pet)} pasirinko tave būsimu šeimininku!`, 'Atmesta': 'Užklausa atmesta' }[st]);
      toast(st === 'Pasirinktas' ? `${r.pet.name} pažymėtas kaip rezervuotas` : 'Būsena pakeista');
      if (st === 'Atmesta') return renderChat(box, reqId);
      drawInfo(); loadMsgs();
    });
    const found = $('[data-found]', box);
    if (found) found.onclick = async () => {
      if (!await confirmDialog(`Pažymėti, kad ${r.pet.name} rado namus?`, 'Taip')) return;
      await api.updatePet(r.pet.id, { status: 'Rado namus' }); r.pet.status = 'Rado namus';
      await sys(`${r.pet.name} rado namus! Ačiū, kad naudojatės Fauner.`);
      toast(`${r.pet.name} rado namus!`); drawInfo(); loadMsgs();
    };
    const cancel = $('[data-cancel]', box);
    if (cancel) cancel.onclick = async () => {
      if (!await confirmDialog('Atšaukti užklausą?', 'Atšaukti užklausą', true)) return;
      await api.updateRequest(r.id, { status: 'Atšaukta' }); await sys('Užklausa atšaukta');
      toast('Užklausa atšaukta'); renderChat(box, reqId);
    };
  }

  let shown = -1;
  async function loadMsgs() {
    const msgs = await api.listMessages(r.id);
    if (msgs.length === shown) return;
    shown = msgs.length;
    const el = $('#msgs', box);
    el.innerHTML = `<div class="sys">${r.queued ? 'Įrašyta į eilę' : 'Užklausa išsiųsta'} · klausimynas pridėtas · ${timeAgo(r.created_at)}</div>` +
      msgs.map(m => m.kind === 'system' ? `<div class="sys">${esc(m.body)} · ${timeAgo(m.created_at)}</div>`
        : `<div class="msg ${m.sender_id === u.id ? 'me' : ''}"><p>${esc(m.body)}</p><span>${timeAgo(m.created_at)}</span></div>`).join('');
    el.scrollTop = el.scrollHeight;
    api.markRead(r);
  }

  const form = $('#send', box);
  if (form) form.onsubmit = async e => {
    e.preventDefault();
    const inp = e.target.body, body = inp.value.trim();
    if (!body) return;
    inp.value = '';
    try { await api.sendMessage(r.id, body); await loadMsgs(); } catch (err) { toast(err.message, 'err'); inp.value = body; }
  };
  drawInfo();
  await loadMsgs();
  after(box, () => {
    const hash = location.hash;
    const t = setInterval(() => { if (location.hash !== hash || !box.isConnected) clearInterval(t); else if (!document.hidden) loadMsgs(); }, 5000);
    const el = $('#msgs', box); el.scrollTop = el.scrollHeight;
  });
}
