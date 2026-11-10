// Užklausa priglausti, žinutės ir pokalbis
import { api } from '../api.js?v=11';
import { esc, $, $$, icon, go, back, toast, ageText, breedText, ownerName, photo, requireLogin, timeAgo, confirmDialog, after, unread } from '../app.js?v=11';

const REQ_CLASS = { 'Išsiųsta': 'st-gray', 'Peržiūrėta': 'st-res', 'Pakviestas susitikti': 'st-wait', 'Pasirinktas': 'st-wait', 'Atmesta': 'st-red', 'Atšaukta': 'st-gray' };
export const reqChip = (s, queued) => `<span class="chip ${REQ_CLASS[s] || ''}">${esc(queued && ['Išsiųsta', 'Peržiūrėta'].includes(s) ? 'Eilėje' : s)}</span>`;

const petMini = p => `
  <div class="mini">
    <img src="${esc(photo(p))}" alt="">
    <div><b>${esc(p.name)}, ${ageText(p.birth_date)}</b><span class="sub">${esc(breedText(p))} · ${esc(ownerName(p))} · ${esc(p.city)}</span></div>
  </div>`;

// Papildomi atsakymai saugomi esamame motivation lauke, todėl nereikia keisti DB schemos.
// Šis skirtukas leidžia atskirai atvaizduoti motyvaciją ir kitus klausimus.
const ANSWERS_SEPARATOR = '\n\n--- Papildomi atsakymai ---\n';

export function requestDetailsHtml(r) {
  const isShelter = r.pet?.owner?.role === 'shelter' || !!r.housing;
  const raw = r.motivation || '';
  if (!isShelter) return `<div class="request-answer"><b>Pradinė žinutė</b><p class="request-text">${esc(raw || 'Žinutė nepateikta.')}</p></div>`;

  const [reason, extra] = raw.split(ANSWERS_SEPARATOR, 2);
  return `<div class="request-answer">
    <b>Kodėl nori priglausti?</b>
    <p class="request-text">${esc(reason || 'Nenurodyta')}</p>
    ${extra ? `<div class="request-extra">${esc(extra)}</div>` : ''}
  </div>`;
}

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
  const isShelter = p.owner?.role === 'shelter';
  const options = arr => arr.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  box.innerHTML = `
    <div class="narrow">
      <button class="back" data-back>${icon('back')} ${queued ? 'Stoti į eilę' : 'Užklausa priglausti'}</button>
      ${petMini(p)}
      ${queued ? `<div class="notice">Gyvūnas šiuo metu rezervuotas. Užklausa bus įrašyta į eilę – jei nepavyks su dabartiniais kandidatais, ${isShelter ? 'prieglauda' : 'globėjas'} susisieks su tavimi.</div>` : ''}
      <form class="form" id="f">
        ${isShelter ? `
          <h2>Prieglaudos klausimynas</h2>
          <p class="sub">Prieglauda prašo šios informacijos, kad galėtų įvertinti, ar gyvūnui tiks būsimi namai. Atsakymus matys skelbimo prieglauda.</p>
          <label>Vardas, pavardė<input class="input" name="full_name" required maxlength="120" value="${esc(u.name || '')}"></label>
          <div class="two">
            <label>Telefonas <span class="opt">(nebūtina)</span><input class="input" name="phone" type="tel" maxlength="40" placeholder="+370 6xx xxxxx"></label>
            <label>Miestas<input class="input" name="city" required maxlength="120" value="${esc(u.city || '')}"></label>
          </div>
          <label>Kur gyvens gyvūnas?
            <select class="input" name="housing" required><option value="">Pasirink</option>${options(['Butas', 'Namas su kiemu', 'Namas be kiemo', 'Kita'])}</select>
          </label>
          <label>Ar gyvenamojoje vietoje leidžiama laikyti gyvūną?
            <select class="input" name="permission" required><option value="">Pasirink</option>${options(['Taip', 'Ne', 'Nežinau'])}</select>
          </label>
          <label>Ar turi kitų augintinių?
            <select class="input" name="has_pets" required><option value="">Pasirink</option>${options(['Taip', 'Ne'])}</select>
          </label>
          <label>Kiek laiko per dieną gyvūnas paprastai būtų vienas?
            <select class="input" name="alone" required><option value="">Pasirink</option>${options(['0–2 val.', '3–5 val.', '6–8 val.', 'Daugiau nei 8 val.'])}</select>
          </label>
          <label>Ar turi patirties prižiūrint gyvūnus?
            <select class="input" name="experience" required><option value="">Pasirink</option>${options(['Taip', 'Ne'])}</select>
          </label>
          <label>Kodėl nori priglausti šį gyvūną?
            <textarea class="input" name="motivation" rows="4" required minlength="10" maxlength="1500" placeholder="Trumpai papasakok apie save ir kodėl pasirinkai šį gyvūną"></textarea>
          </label>
          <label>Papildoma informacija <span class="opt">(nebūtina)</span>
            <textarea class="input" name="notes" rows="3" maxlength="1000" placeholder="Ką dar prieglaudai būtų svarbu žinoti?"></textarea>
          </label>
          <p class="sub small">Pateiktą informaciją matys tik su šiuo gyvūnu susijusi prieglauda. Nepateik slaptažodžių ar asmens dokumentų numerių.</p>`
        : `
          <h2>Žinutė globėjui</h2>
          <p class="sub">Parašyk trumpą žinutę apie save ir kodėl norėtum priglausti ${esc(p.name)}. Jokio papildomo klausimyno nereikia.</p>
          <label>Jūsų žinutė
            <textarea class="input" name="message" rows="5" required minlength="5" maxlength="2000" placeholder="Sveiki, norėčiau priglausti ${esc(p.name)}. Norėčiau sužinoti…"></textarea>
          </label>
          <p class="sub small">Žinutę matys tik šio gyvūno globėjas. Galėsite tęsti pokalbį skiltyje „Žinutės“.</p>`}
        <button class="btn primary block" type="submit">${queued ? 'Stoti į eilę' : 'Siųsti užklausą'}</button>
      </form>
    </div>`;
  $('[data-back]', box).onclick = () => back(`gyvunas/${p.id}`);
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const btn = e.submitter || e.currentTarget.querySelector('[type=submit]');
    if (btn) btn.disabled = true;
    try {
      const motivation = isShelter
        ? `${String(f.get('motivation') || '').trim()}${ANSWERS_SEPARATOR}${[
            `Leidžiama laikyti gyvūnus: ${f.get('permission')}`,
            `Vienas namuose: ${f.get('alone')}`,
            `Patirtis: ${f.get('experience')}`,
            ...(String(f.get('notes') || '').trim() ? [`Papildoma informacija: ${String(f.get('notes')).trim()}`] : []),
          ].join('\n')}`
        : String(f.get('message') || '').trim();
      if (!motivation.trim() || (isShelter && !String(f.get('full_name') || '').trim())) {
        throw new Error('Užpildyk privalomus formos laukus');
      }
      const r = await api.createRequest({
        pet_id: p.id,
        queued,
        full_name: isShelter ? String(f.get('full_name') || '').trim() : (u.name || 'Vartotojas').trim(),
        phone: isShelter ? String(f.get('phone') || '').trim() : '',
        city: isShelter ? String(f.get('city') || '').trim() : (u.city || ''),
        housing: isShelter ? String(f.get('housing') || '') : '',
        has_pets: isShelter && f.get('has_pets') === 'Taip',
        motivation,
      });
      go(`gyvunas/${p.id}/issiusta/${r.id}`);
    } catch (err) { if (btn) btn.disabled = false; toast(err.message, 'err'); }
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
    const hasQuestionnaire = !!r.housing;
    const q = `${hasQuestionnaire ? `<div class="q-sum"><span>${esc(r.housing)}</span><span>${r.has_pets ? 'Turi kitų gyvūnų' : 'Neturi kitų gyvūnų'}</span>${r.city ? `<span>${esc(r.city)}</span>` : ''}</div>` : ''}
      ${requestDetailsHtml(r)}`;
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
      <details class="request-sent-info"><summary class="link small">${hasQuestionnaire ? 'Peržiūrėti savo atsakymus' : 'Peržiūrėti išsiųstą žinutę'}</summary>${q}</details>
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
    el.innerHTML = `<div class="sys">${r.queued ? 'Įrašyta į eilę' : 'Užklausa išsiųsta'} · ${r.housing ? 'klausimynas pridėtas' : 'žinutė pridėta'} · ${timeAgo(r.created_at)}</div>` +
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
