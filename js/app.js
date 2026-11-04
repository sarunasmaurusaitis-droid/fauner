// Fauner – maršrutizatorius, išdėstymas ir bendros pagalbinės funkcijos
import { api, DEMO } from './api.js?v=10';
import * as search from './pages/search.js?v=10';
import * as pet from './pages/pet.js?v=10';
import * as requests from './pages/requests.js?v=10';
import * as listings from './pages/listings.js?v=10';
import * as admin from './pages/admin.js?v=10';
import * as account from './pages/account.js?v=10';
import * as info from './pages/info.js?v=10';

// ---------- Pagalbinės funkcijos ----------
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const go = path => { location.hash = '#/' + path.replace(/^\/+/, ''); };
export const back = fallback => { if (history.length > 1 && sessionStorage.getItem('fauner-nav')) history.back(); else go(fallback); };

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
};
export const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

export const STATUS_CLASS = { 'Laukia namų': 'st-wait', 'Rezervuotas': 'st-res', 'Rado namus': 'st-home' };
export const statusChip = s => `<span class="chip ${STATUS_CLASS[s] || ''}">${esc(s)}</span>`;

// Amžius skaičiuojamas iš (apytikslės) gimimo datos, todėl laikui bėgant atsinaujina
export const ageMonths = birth => Math.max(0, Math.round((Date.now() - new Date(birth)) / (30.4375 * 864e5)));
export const ageText = birth => {
  const m = ageMonths(birth), y = Math.floor(m / 12), r = m % 12;
  if (y === 0) return `${Math.max(1, r)} mėn.`;
  if (y < 3 && r) return `${y} m. ${r} mėn.`;
  return `${y} m.`;
};
export const birthFrom = (years, months) => {
  const d = new Date(); d.setMonth(d.getMonth() - (Number(years || 0) * 12 + Number(months || 0)));
  return d.toISOString().slice(0, 10);
};
export const breedText = p => p.mixed ? (p.breed.startsWith('Nežinoma') ? 'Mišrūnas' : `${p.breed} (mišrūnas)`) : p.breed;

export const initial = s => (String(s || '?').replace(/^(VšĮ|UAB|MB|Všį)\s*/i, '').replace(/[^\p{L}]/gu, '')[0] || '?').toUpperCase();
export const ownerName = p => p.owner ? (p.owner.shelter_name || p.owner.name) : (p.org_name || 'Fauner');
export const isVerified = p => !!(p.owner && p.owner.role === 'shelter' && p.owner.verified);
export const photo = (p, i = 0) => (p.photos && p.photos[i]) || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#F5F5F7"/></svg>');
export const timeAgo = iso => {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return 'ką tik';
  if (d < 3600) return `prieš ${Math.floor(d / 60)} min.`;
  if (d < 86400) return new Date(iso).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor(d / 86400);
  return days === 1 ? 'vakar' : `prieš ${days} d.`;
};
export const plural = (n, one, few, many) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return `${n} ${one}`;
  if (a >= 2 && a <= 9 && (b < 10 || b > 20)) return `${n} ${few}`;
  return `${n} ${many}`;
};

export function toast(msg, type = '') {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast ' + type; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
}

export function confirmDialog(text, okLabel = 'Taip', danger = false) {
  return new Promise(res => {
    const d = document.createElement('div');
    d.className = 'overlay';
    d.innerHTML = `<div class="dialog" role="dialog"><p>${esc(text)}</p><div class="row gap end"><button class="btn ghost" data-a="0">Atšaukti</button><button class="btn ${danger ? 'danger' : 'primary'}" data-a="1">${esc(okLabel)}</button></div></div>`;
    d.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a || e.target === d) { d.remove(); res(a?.dataset.a === '1'); } });
    document.body.appendChild(d);
  });
}

export function promptDialog(text, placeholder = '', okLabel = 'Gerai') {
  return new Promise(res => {
    const d = document.createElement('div');
    d.className = 'overlay';
    d.innerHTML = `<form class="dialog"><p>${esc(text)}</p><textarea class="input" rows="3" placeholder="${esc(placeholder)}"></textarea><div class="row gap end"><button type="button" class="btn ghost" data-a="0">Atšaukti</button><button class="btn primary">${esc(okLabel)}</button></div></form>`;
    const close = v => { d.remove(); res(v); };
    $('[data-a]', d).onclick = () => close(null);
    $('form', d).onsubmit = e => { e.preventDefault(); close($('textarea', d).value); };
    document.body.appendChild(d); $('textarea', d).focus();
  });
}

export function requireLogin(msg = 'Prisijunk, kad galėtum tęsti') {
  if (api.user) {
    if (api.user.banned) { toast('Tavo paskyra užblokuota. Susisiek su administracija.', 'err'); return false; }
    return true;
  }
  sessionStorage.setItem('fauner-after-login', location.hash.slice(2));
  toast(msg); go('prisijungti');
  return false;
}
export const isAdmin = () => api.user?.role === 'admin';
export const isShelter = () => api.user?.role === 'shelter';

// Išsaugoti gyvūnai
export const favs = { ids: new Set(), async load() { this.ids = await api.favoriteIds(); } };
export async function toggleFav(petId, btn) {
  if (!requireLogin('Prisijunk, kad galėtum išsaugoti gyvūną')) return;
  const on = !favs.ids.has(petId);
  on ? favs.ids.add(petId) : favs.ids.delete(petId);
  $$(`[data-fav="${petId}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  try { await api.setFavorite(petId, on); toast(on ? 'Išsaugota' : 'Pašalinta iš išsaugotų'); }
  catch (e) { on ? favs.ids.delete(petId) : favs.ids.add(petId); btn?.classList.toggle('on', !on); toast(e.message, 'err'); }
}
export const heartBtn = (p, extra = '') => `<button type="button" class="heart ${favs.ids.has(p.id) ? 'on' : ''} ${extra}" data-fav="${p.id}" aria-label="Išsaugoti" aria-pressed="${favs.ids.has(p.id)}">${icon('heart')}</button>`;
export function bindHearts(root) {
  $$('[data-fav]', root).forEach(b => b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleFav(Number(b.dataset.fav), b); }));
}

export const petCard = p => `
  <a class="card" href="#/gyvunas/${p.id}">
    <div class="card-img"><img src="${esc(photo(p))}" alt="${esc(p.name)}" loading="lazy">${heartBtn(p)}${p.status !== 'Laukia namų' ? `<span class="card-status">${statusChip(p.status)}</span>` : ''}</div>
    <div class="card-body">
      <b>${esc(p.name)}, ${ageText(p.birth_date)}</b>
      <span class="sub">${esc(breedText(p))}</span>
      <span class="sub small row gap-s">${icon('pin', 'xs')} ${esc(p.city)}</span>
    </div>
  </a>`;

// ---------- Neperskaitytos žinutės ----------
export const unread = {
  count: 0,
  async refresh() {
    const u = api.user;
    if (!u || u.banned) { this.set(0); return; }
    try {
      const [mine, incoming] = await Promise.all([api.myRequests(), api.incomingRequests()]);
      const all = [...mine, ...incoming];
      const last = await api.lastMessages(all.map(r => r.id));
      let n = 0;
      for (const r of all) {
        const iAmSeeker = r.seeker_id === u.id;
        const readAt = iAmSeeker ? r.seeker_read_at : r.owner_read_at;
        const lm = last[r.id];
        const newMsg = lm && lm.sender_id !== u.id && lm.created_at > readAt;
        const newReq = !iAmSeeker && r.status === 'Išsiųsta' && r.created_at > readAt;
        if (newMsg || newReq) n++;
      }
      this.set(n);
    } catch { /* tyliai */ }
  },
  set(n) {
    this.count = n;
    $$('[data-badge="zinutes"]').forEach(b => { b.textContent = n > 9 ? '9+' : n; b.hidden = !n; });
    document.title = (n ? `(${n}) ` : '') + 'Fauner – gyvūnų priglaudimas Lietuvoje';
  },
};

// ---------- Navigacija pagal rolę ----------
function navItems() {
  const u = api.user;
  if (!u) return [['', 'search', 'Paieška'], ['apie', 'home', 'Apie Fauner'], ['prisijungti', 'user', 'Prisijungti']];
  const items = [];
  if (u.role === 'admin') items.push(['admin', 'shield', 'Admin']);
  if (u.role === 'shelter') items.push(['skelbimai', 'grid', 'Skydelis']);
  items.push(['', 'search', 'Paieška'], ['issaugoti', 'heart', 'Išsaugoti']);
  if (u.role !== 'shelter') items.push(['skelbimai', 'home', 'Skelbimai']);
  items.push(['zinutes', 'chat', 'Žinutės'], ['profilis', 'user', 'Profilis']);
  return items;
}

function renderShell(path) {
  const top = path.split('/')[0];
  const items = navItems();
  const link = ([p, ic, label]) => `<a href="#/${p}" class="${top === p ? 'active' : ''}">${icon(ic)}${p === 'zinutes' ? '<span class="nbadge" data-badge="zinutes" hidden></span>' : ''}<span>${label}</span></a>`;
  const u = api.user;
  $('#top').innerHTML = `
    <a class="logo" href="#/">fauner</a>
    <nav class="topnav">${items.filter(i => !['profilis', 'prisijungti'].includes(i[0])).map(link).join('')}</nav>
    ${u ? `<a class="me-chip" href="#/profilis"><span class="avatar">${esc(initial(u.shelter_name || u.name))}</span><span>${esc(u.shelter_name || u.name || u.email)}</span></a>`
      : `<a class="btn primary sm hide-mobile" href="#/prisijungti">Prisijungti</a>`}`;
  $('#tabs').innerHTML = items.map(link).join('');
  $('#demo').hidden = !DEMO;
  unread.set(unread.count);
}

function renderFooter() {
  $('#footer').innerHTML = `
    <div class="foot-inner">
      <div><span class="logo sm">fauner</span><p class="sub small">Nemokama gyvūnų priglaudimo platforma Lietuvoje. KTU studentų projektas.</p></div>
      <nav><a href="#/apie">Apie Fauner</a><a href="#/apie#duk">DUK</a><a href="#/taisykles">Taisyklės</a><a href="#/privatumas">Privatumo politika</a><a href="#/kontaktai">Kontaktai</a></nav>
    </div>`;
}

// ---------- Maršrutai ----------
const routes = [
  [/^$/, search.render],
  [/^gyvunas\/(\d+)$/, pet.render],
  [/^gyvunas\/(\d+)\/uzklausa$/, requests.renderForm],
  [/^gyvunas\/(\d+)\/issiusta\/(\d+)$/, requests.renderSent],
  [/^prieglauda\/([\w-]+)$/, pet.renderShelter],
  [/^vartotojas\/([\w-]+)$/, pet.renderShelter],
  [/^uzbaigti-registracija$/, account.renderComplete],
  [/^issaugoti$/, pet.renderSaved],
  [/^zinutes$/, requests.renderInbox],
  [/^zinutes\/(\d+)$/, requests.renderChat],
  [/^skelbimai$/, listings.renderMine],
  [/^skelbimai\/naujas$/, listings.renderForm],
  [/^skelbimai\/(\d+)\/redaguoti$/, listings.renderEdit],
  [/^skelbimai\/(\d+)\/kandidatai$/, listings.renderCandidates],
  [/^admin$/, admin.render],
  [/^admin\/(\w+)$/, admin.render],
  [/^profilis$/, account.renderProfile],
  [/^prieglaudos-paraiska$/, account.renderApplication],
  [/^prisijungti$/, account.renderLogin],
  [/^registracija$/, account.renderRegister],
  [/^slaptazodis$/, account.renderForgot],
  [/^naujas-slaptazodis$/, account.renderNewPassword],
  [/^apie$/, info.renderAbout],
  [/^taisykles$/, info.renderRules],
  [/^privatumas$/, info.renderPrivacy],
  [/^kontaktai$/, info.renderContacts],
];

let renderId = 0;
async function router() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (/access_token|error_description|type=recovery/.test(raw)) return; // Supabase nuoroda iš el. laiško – apdoroja init()
  const [pathq, anchor] = raw.split('#');
  const path = pathq.split('?')[0].replace(/\/$/, '');
  // Prisijungęs per Google / Facebook, bet dar nepatvirtinęs 18+ → pirma užbaigti registraciją
  const free = ['uzbaigti-registracija', 'apie', 'taisykles', 'privatumas', 'kontaktai', 'naujas-slaptazodis'];
  if (api.user && !api.user.onboarded && !free.includes(path)) { go('uzbaigti-registracija'); return; }
  renderShell(path);
  const main = $('#main');
  const myId = ++renderId;
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) {
      main.innerHTML = '<div class="loading">Kraunama…</div>';
      window.scrollTo(0, 0);
      try {
        const box = document.createElement('div');
        box.className = 'page';
        await fn(box, ...m.slice(1));
        if (myId === renderId) {
          main.replaceChildren(box); box._after?.(main);
          if (anchor) document.getElementById(anchor)?.scrollIntoView();
        }
      } catch (e) {
        console.error(e);
        if (myId === renderId) main.innerHTML = `<div class="empty"><h2>Nepavyko įkelti</h2><p>${esc(e.message)}</p><a class="btn ghost" href="#/">Į paiešką</a></div>`;
      }
      return;
    }
  }
  main.innerHTML = `<div class="empty"><h2>Puslapis nerastas</h2><a class="btn primary" href="#/">Į paiešką</a></div>`;
}

export const after = (box, fn) => { box._after = fn; };

(async function start() {
  const startHash = location.hash;
  try { await api.init(); }
  catch (e) { $('#main').innerHTML = `<div class="empty"><h2>Nepavyko prisijungti prie duomenų bazės</h2><p>${esc(e.message)}</p></div>`; return; }
  await favs.load();
  renderFooter();
  api.onChange(async () => { await favs.load(); unread.refresh(); router(); });
  api.onRecovery(() => go('naujas-slaptazodis'));
  $('#demo-reset')?.addEventListener('click', async () => {
    if (await confirmDialog('Atkurti pradinius demonstracinius duomenis?', 'Atkurti')) { api.resetDemo(); go(''); }
  });
  window.addEventListener('hashchange', () => { sessionStorage.setItem('fauner-nav', '1'); router(); });
  if (/type=recovery/.test(startHash)) go('naujas-slaptazodis');
  else if (/error_description/.test(startHash)) { toast(decodeURIComponent(startHash.match(/error_description=([^&]+)/)[1]).replace(/\+/g, ' '), 'err'); go(''); }
  else if (/access_token/.test(startHash)) { toast('El. paštas patvirtintas!'); go(''); }
  else router();
  unread.refresh();
  setInterval(() => { if (!document.hidden) unread.refresh(); }, 30000);
  info.maybeShowIntro();
})();
