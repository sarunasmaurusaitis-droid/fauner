// Demonstracinis režimas: tas pats API kaip api.js, bet duomenys laikomi naršyklės localStorage.
// Naudojamas, kol config.js neįrašyti Supabase raktai. Demo paskyros: žr. README.
import { compressImage } from './image.js?v=10';
import { saleWords } from './data.js?v=10';

const KEY = 'fauner-demo-v3';
const U = id => `https://images.unsplash.com/photo-${id}?w=900&q=80`;
const daysAgo = d => new Date(Date.now() - d * 864e5).toISOString();
const born = days => new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

function seed() {
  const users = [
    { id: 'u-gabija', email: 'gabija@demo.lt', name: 'Gabija Petraitė', role: 'user', city: 'Klaipėda', shelter_name: '', verified: false, banned: false, onboarded: true, avatar_url: '', created_at: daysAgo(30) },
    { id: 'u-letenele', email: 'letenele@demo.lt', name: 'Neringa', role: 'shelter', city: 'Klaipėda', shelter_name: 'VšĮ „Letenėlė“', verified: true, banned: false, onboarded: true, avatar_url: '', phone: '+370 600 00001', website: 'https://facebook.com', address: 'Taikos pr. 12, Klaipėda', about: 'Globojame šunis ir kates Klaipėdos regione nuo 2015 metų.', created_at: daysAgo(90) },
    { id: 'u-globa', email: 'globa@demo.lt', name: 'Rūta', role: 'shelter', city: 'Vilnius', shelter_name: 'Gyvūnų globa Vilniuje', verified: true, banned: false, onboarded: true, avatar_url: '', phone: '+370 600 00002', website: '', address: 'Vilnius', about: '', created_at: daysAgo(80) },
    { id: 'u-ona', email: 'ona@demo.lt', name: 'Ona K.', role: 'user', city: 'Kretinga', shelter_name: '', verified: false, banned: false, onboarded: true, avatar_url: '', created_at: daysAgo(10) },
    { id: 'u-admin', email: 'admin@demo.lt', name: 'Administratorius', role: 'admin', city: '', shelter_name: '', verified: false, banned: false, onboarded: true, avatar_url: '', created_at: daysAgo(100) },
    { id: 'u-jonas', email: 'jonas@demo.lt', name: 'Jonas', role: 'user', city: 'Kaunas', shelter_name: '', verified: false, banned: false, onboarded: true, avatar_url: '', created_at: daysAgo(5) },
  ];
  let pid = 0;
  const P = (owner_id, name, species, breed, mixed, days, sex, city, description, traits, health, photos, status, ago) =>
    ({ id: ++pid, owner_id, org_name: '', name, species, breed, mixed, birth_date: born(days), sex, city, description, traits, health, photos, status, queue_open: true, hidden: false, archived: false, review_status: 'ok', review_reason: '', created_at: daysAgo(ago), updated_at: daysAgo(ago) });
  const K = 'Kastruotas / sterilizuotas';
  const pets = [
    P('u-letenele', 'Rudis', 'Šuo', 'Biglis', false, 1460, 'Patinas', 'Klaipėda', 'Rudis – ramus ir labai meilus šuo. Prieglaudoje gyvena aštuonis mėnesius. Mėgsta ilgus pasivaikščiojimus, gerai sutaria su vaikais ir kitais šunimis. Tinka ir butui, jei kasdien bus bent valanda lauke.', ['Ramus', 'Draugiškas vaikams', 'Tinka butui', 'Sutaria su kitais'], ['Paskiepytas', K, 'Čipuotas'], [U('1774440865389-194cf5acba8c'), U('1774440865384-f26022125340')], 'Laukia namų', 2),
    P('u-globa', 'Mila', 'Katė', 'Europinė trumpaplaukė', false, 365, 'Patelė', 'Vilnius', 'Mila – smalsi ir žaisminga katytė. Mėgsta sėdėti ant palangės ir stebėti paukščius.', ['Aktyvus', 'Tinka butui'], ['Paskiepytas', 'Čipuotas'], [U('1625060241508-22488e1e9264'), U('1625060299486-4c08fe81cdf5')], 'Rezervuotas', 3),
    P('u-globa', 'Kiwi', 'Šuo', 'Velso korgis', false, 300, 'Patinas', 'Vilnius', 'Kiwi – energingas šuniukas, kuriam reikia aktyvios šeimos ir daug žaidimų.', ['Aktyvus', 'Draugiškas vaikams'], ['Paskiepytas'], [U('1537151608828-ea2b11777ee8'), U('1537151625747-768eb6cf92b2')], 'Laukia namų', 4),
    P('u-globa', 'Murka', 'Katė', 'Europinė trumpaplaukė', false, 1095, 'Patelė', 'Kaunas', 'Murka – rami katė, mėgstanti glaustis. Tinka žmonėms, kurie daug laiko praleidžia namuose.', ['Ramus', 'Tinka butui'], ['Paskiepytas', K], [U('1547468137-1ad02f558bec'), U('1487160342031-439ea29c3c7b')], 'Laukia namų', 5),
    P('u-letenele', 'Juodis', 'Šuo', 'Džeko Raselo terjeras', false, 730, 'Patinas', 'Klaipėda', 'Juodis – linksmas ir protingas, greitai mokosi komandų.', ['Aktyvus', 'Sutaria su kitais'], ['Paskiepytas', 'Čipuotas'], [U('1599908758973-b02eb044e5ab'), U('1599908758979-25ba52737fb5')], 'Laukia namų', 6),
    P('u-letenele', 'Bella', 'Šuo', 'Australų aviganis', true, 1095, 'Patelė', 'Palanga', 'Bella – švelni ir draugiška kalytė, mėgsta vaikus ir pasivaikščiojimus prie jūros.', ['Draugiškas vaikams', 'Sutaria su kitais'], ['Paskiepytas', K, 'Čipuotas'], [U('1627961314781-efd6a0360260'), U('1628884978036-35035df5968b')], 'Laukia namų', 7),
    P('u-globa', 'Mėta', 'Katė', 'Europinė trumpaplaukė', false, 730, 'Patelė', 'Vilnius', 'Mėta – drąsi katytė, kuri greitai pripranta prie naujų namų.', ['Aktyvus', 'Tinka butui'], ['Paskiepytas'], [U('1518791841217-8f162f1e1131'), U('1471874276752-65e2d717604a')], 'Rezervuotas', 8),
    P('u-letenele', 'Maksas', 'Šuo', 'Dalmatinas', true, 1825, 'Patinas', 'Šiauliai', 'Maksas – ištikimas didelis šuo, tinkamas namui su kiemu.', ['Ramus', 'Sutaria su kitais'], ['Paskiepytas', K, 'Čipuotas'], [U('1626435872652-674a80247929'), U('1626435872665-2e39a0614b4e')], 'Laukia namų', 9),
    P('u-globa', 'Pūkis', 'Triušis', 'Liūtagalvis triušis', false, 365, 'Patinas', 'Vilnius', 'Pūkis – ramus triušis, pratęs prie žmonių rankų.', ['Ramus', 'Tinka butui'], [], [U('1759687083629-d64eeacdb5f8'), U('1759687084201-ef8e95b17796')], 'Laukia namų', 10),
    P('u-letenele', 'Garfas', 'Katė', 'Europinė trumpaplaukė', false, 2190, 'Patinas', 'Klaipėda', 'Garfas – ramus katinas, mėgsta miegoti saulėje.', ['Ramus'], ['Paskiepytas', K], [U('1769922927973-7a530f3752df'), U('1769922928084-08b00a5f92e0')], 'Laukia namų', 11),
    P('u-letenele', 'Auksė', 'Šuo', 'Auksaspalvis retriveris', false, 2555, 'Patelė', 'Klaipėda', 'Auksė jau rado namus – ačiū naujai šeimai!', ['Ramus', 'Draugiškas vaikams'], ['Paskiepytas', K, 'Čipuotas'], [U('1552053831-71594a27632d')], 'Rado namus', 12),
    P('u-ona', 'Bosas', 'Šuo', 'Mopsas', false, 1095, 'Patinas', 'Kretinga', 'Bosas – mopsas, kuris mėgsta snausti ant sofos. Atiduodu, nes išvykstu dirbti į užsienį.', ['Ramus', 'Tinka butui', 'Draugiškas vaikams'], ['Paskiepytas', 'Čipuotas'], [U('1518020382113-a7e8fc38eac9')], 'Laukia namų', 1),
    { ...P('u-jonas', 'Šuniukai', 'Šuo', 'Labradoro retriveris', false, 60, 'Patinas', 'Kaunas', 'Šuniukai su dokumentais, kaina 150 eur, rašykite.', ['Aktyvus'], [], [U('1601979031925-424e53b6caaa')], 'Laukia namų', 0.3), review_status: 'pending', review_reason: 'Rasti žodžiai: kaina, eur' },
    P(null, 'Pirmasis', 'Šuo', 'Rusų toiterjeras', true, 200, 'Patinas', 'Šakiai', 'Pradinis skelbimas be savininko – adminas turi jį priskirti.', ['Aktyvus'], [], [U('1561037404-61cd46aa615b')], 'Laukia namų', 15),
  ];
  const requests = [
    { id: 1, pet_id: 1, seeker_id: 'u-gabija', full_name: 'Gabija Petraitė', phone: '+370 600 00000', city: 'Klaipėda', housing: 'Butas', has_pets: false, motivation: 'Turiu daug laiko vakarais ir mėgstu ilgus pasivaikščiojimus.', status: 'Pakviestas susitikti', queued: false, created_at: daysAgo(1), seeker_read_at: daysAgo(0.9), owner_read_at: daysAgo(0.95) },
    { id: 2, pet_id: 12, seeker_id: 'u-jonas', full_name: 'Jonas Jonaitis', phone: '', city: 'Kaunas', housing: 'Namas su kiemu', has_pets: true, motivation: 'Turime kiemą ir dar vieną ramų šunį.', status: 'Išsiųsta', queued: false, created_at: daysAgo(0.2), seeker_read_at: daysAgo(0.2), owner_read_at: '1970-01-01T00:00:00Z' },
  ];
  const messages = [
    { id: 1, request_id: 1, sender_id: 'u-letenele', kind: 'text', body: 'Labas, Gabija! Ačiū už užklausą. Ar galėtumėte atvykti susipažinti su Rudžiu šeštadienį 12 val.?', created_at: daysAgo(0.95) },
    { id: 2, request_id: 1, sender_id: 'u-gabija', kind: 'text', body: 'Taip, labai norėčiau!', created_at: daysAgo(0.9) },
    { id: 3, request_id: 1, sender_id: 'u-letenele', kind: 'text', body: 'Puiku, laukiame šeštadienį. Adresas: Taikos pr. 12, Klaipėda.', created_at: daysAgo(0.1) },
  ];
  const reports = [{ id: 1, pet_id: 8, reporter_id: 'u-gabija', reason: 'Netinkamos nuotraukos ar tekstas', details: '', status: 'Nauja', created_at: daysAgo(0.05) }];
  const applications = [{ id: 1, user_id: 'u-jonas', org_name: 'Kauno letenos', legal_form: 'Juridinis asmuo', company_code: '123456789', vmvt_ref: 'GG-123', address: 'Savanorių pr. 1, Kaunas', city: 'Kaunas', contact_person: 'Jonas Jonaitis', phone: '+370 600 00003', email: 'info@kaunoletenos.lt', website: 'https://facebook.com/kaunoletenos', about: 'Globojame kates Kaune.', docs: [], status: 'Laukia', admin_note: '', created_at: daysAgo(0.5) }];
  const birth = Object.fromEntries(users.map(u => [u.id, '1995-05-05']));
  return { birth, users, pets, favorites: [{ user_id: 'u-gabija', pet_id: 1 }], requests, messages, reports, applications, session: null, seq: 100 };
}

function checkPet(d) {
  if (!d.name?.trim() || !d.breed?.trim() || !d.city?.trim() || !d.photos?.length || (d.description || '').trim().length < 20)
    throw new Error('Skelbime privalo būti vardas, veislė, miestas, bent viena nuotrauka ir aprašymas (bent 20 simbolių)');
}

export function createDemoApi() {
  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { } };
  const nid = () => ++db.seq;
  const now = () => new Date().toISOString();
  const listeners = new Set();
  const emit = () => listeners.forEach(f => f(api.user));
  const clone = x => JSON.parse(JSON.stringify(x));
  const me = () => db.users.find(u => u.id === db.session) || null;
  const pub = u => u && { id: u.id, name: u.name, role: u.role, shelter_name: u.shelter_name, verified: u.verified, city: u.city, banned: u.banned, avatar_url: u.avatar_url || '' };
  const withOwner = p => p && { ...clone(p), owner: pub(db.users.find(u => u.id === p.owner_id)) };
  const withReq = r => r && { ...clone(r), pet: withOwner(db.pets.find(p => p.id === r.pet_id)), seeker: pub(db.users.find(u => u.id === r.seeker_id)) };
  const need = () => { const u = me(); if (!u) throw new Error('Reikia prisijungti'); if (u.banned) throw new Error('Paskyra užblokuota'); return u; };
  const active = () => { const u = need(); if (!u.onboarded) throw new Error('Užbaik registraciją: patvirtink, kad tau 18 metų'); return u; };
  const isAdmin = () => me()?.role === 'admin';
  const wait = v => new Promise(r => setTimeout(() => r(v), 40));
  const byNew = (a, b) => b.created_at.localeCompare(a.created_at);
  const pet = id => db.pets.find(x => x.id == id);
  const canEdit = p => p && (p.owner_id === db.session || isAdmin());
  const cleanupPet = id => {
    const reqIds = db.requests.filter(r => r.pet_id == id).map(r => r.id);
    db.requests = db.requests.filter(r => r.pet_id != id);
    db.messages = db.messages.filter(m => !reqIds.includes(m.request_id));
    db.favorites = db.favorites.filter(f => f.pet_id != id);
    db.reports = db.reports.filter(r => r.pet_id != id);
  };
  // Ta pati „ne pardavimui“ taisyklė kaip duomenų bazėje
  const saleCheck = (p, old) => {
    if (isAdmin()) return;
    const w = saleWords(p.name + ' ' + p.description);
    if (w.length) { p.review_status = 'pending'; p.review_reason = 'Rasti žodžiai: ' + w.join(', '); }
    else if (old && p.review_status === 'pending' && p.review_reason.startsWith('Rasti žodžiai:')) { p.review_status = 'ok'; p.review_reason = ''; }
  };
  const readFile = f => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(f); });

  const api = {
    demo: true,
    get user() { const u = me(); return u && clone(u); },
    async init() { },
    onChange(f) { listeners.add(f); },
    onRecovery() { },
    async reloadUser() { return api.user; },
    resetDemo() { db = seed(); save(); emit(); },

    async signUp({ email, password, name, city, birth_date }) {
      email = (email || '').trim().toLowerCase();
      if (!birth_date || new Date(birth_date) > new Date(new Date().setFullYear(new Date().getFullYear() - 18))) throw new Error('Fauner gali naudotis tik pilnamečiai (nuo 18 metų)');
      if (!email || !password) throw new Error('Įveskite el. paštą ir slaptažodį');
      if (password.length < 6) throw new Error('Slaptažodis turi būti bent 6 simbolių');
      if (db.users.some(u => u.email === email)) throw new Error('Toks vartotojas jau užregistruotas');
      const u = { id: 'u-' + nid(), email, name, role: 'user', city: city || '', shelter_name: '', verified: false, banned: false, onboarded: true, avatar_url: '', created_at: now() };
      db.users.push(u); db.session = u.id; save(); emit();
      return wait({ needsConfirm: false });
    },
    async signIn(email) {
      const u = db.users.find(x => x.email === email.trim().toLowerCase());
      if (!u) throw new Error('Neteisingas el. paštas arba slaptažodis');
      db.session = u.id; save(); emit(); return wait();
    },
    async signInWith(provider) { throw new Error(`Prisijungimas per ${provider === 'google' ? 'Google' : 'Facebook'} veikia tik su tikra duomenų baze`); },
    async completeProfile({ birth_date, city, name }) {
      const u = need();
      if (!birth_date || new Date(birth_date) > new Date(new Date().setFullYear(new Date().getFullYear() - 18))) throw new Error('Fauner gali naudotis tik pilnamečiai (nuo 18 metų)');
      db.birth[u.id] = birth_date; Object.assign(u, { onboarded: true, city: city || u.city, name: name || u.name }); save(); emit();
    },
    async myBirthDate() { return db.birth?.[db.session] || ''; },
    async uploadAvatar(file) { const u = need(); u.avatar_url = await readFile(await compressImage(file, 300, 0.8)); save(); return clone(u); },
    async signOut() { db.session = null; save(); emit(); },
    async resetPassword() { return wait(); },
    async updatePassword() { return wait(); },
    async updateEmail(email) { const u = need(); u.email = email.trim().toLowerCase(); save(); return wait(); },
    async updateProfile(patch) {
      const u = need(); const p = { ...patch };
      if (!isAdmin()) { delete p.verified; delete p.role; delete p.banned; delete p.onboarded; }
      Object.assign(u, p); save(); return wait(clone(u));
    },
    async deleteAccount() {
      const u = need();
      db.pets.filter(p => p.owner_id === u.id).forEach(p => cleanupPet(p.id));
      db.pets = db.pets.filter(p => p.owner_id !== u.id);
      db.requests = db.requests.filter(r => r.seeker_id !== u.id);
      db.users = db.users.filter(x => x.id !== u.id); db.session = null; save(); emit();
    },
    async getProfile(id) { const u = db.users.find(x => x.id === id); return wait(u ? { ...pub(u), avatar_url: u.avatar_url || '', phone: u.phone || '', website: u.website || '', address: u.address || '', about: u.about || '' } : null); },

    async listPets() { return wait(db.pets.filter(p => !p.hidden && !p.archived && p.owner_id && p.review_status === 'ok').sort(byNew).map(withOwner)); },
    async petsByOwner(uid) { return wait(db.pets.filter(p => p.owner_id === uid && !p.hidden && !p.archived && p.review_status === 'ok').sort(byNew).map(withOwner)); },
    async getPet(id) {
      const p = pet(id);
      if (!p) return wait(null);
      if ((p.hidden || p.archived || !p.owner_id || p.review_status !== 'ok') && !canEdit(p)) return wait(null);
      return wait(withOwner(p));
    },
    async myPets() { const u = need(); return wait(db.pets.filter(p => p.owner_id === u.id).sort(byNew).map(withOwner)); },
    async createPet(d) {
      const u = active(); checkPet(d);
      const p = { status: 'Laukia namų', traits: [], health: [], photos: [], queue_open: true, ...d, org_name: '', id: nid(), owner_id: u.id, hidden: false, archived: false, review_status: 'ok', review_reason: '', created_at: now(), updated_at: now() };
      saleCheck(p, null);
      db.pets.push(p); save(); return wait(withOwner(p));
    },
    async updatePet(id, d) {
      const p = pet(id);
      if (!canEdit(p)) throw new Error('Neturite teisės');
      const patch = { ...d }; if (!isAdmin()) { delete patch.hidden; delete patch.owner_id; delete patch.review_status; delete patch.review_reason; }
      if ('description' in patch || 'photos' in patch || 'name' in patch) checkPet({ ...p, ...patch });
      const old = { ...p };
      Object.assign(p, patch, { updated_at: now() });
      if (p.name !== old.name || p.description !== old.description) saleCheck(p, old);
      save(); return wait(withOwner(p));
    },
    async deletePet(id) {
      if (!canEdit(pet(id))) throw new Error('Neturite teisės');
      cleanupPet(id); db.pets = db.pets.filter(x => x.id != id); save(); return wait();
    },
    async uploadPhoto(file) { return readFile(await compressImage(file, 900, 0.8)); },

    async favoriteIds() { const u = me(); return wait(new Set(u ? db.favorites.filter(f => f.user_id === u.id).map(f => f.pet_id) : [])); },
    async setFavorite(id, on) {
      const u = need();
      db.favorites = db.favorites.filter(f => !(f.user_id === u.id && f.pet_id == id));
      if (on) db.favorites.push({ user_id: u.id, pet_id: Number(id) });
      save(); return wait();
    },

    async createRequest(d) {
      const u = active();
      const r = { status: 'Išsiųsta', queued: false, ...d, pet_id: Number(d.pet_id), id: nid(), seeker_id: u.id, created_at: now(), seeker_read_at: now(), owner_read_at: '1970-01-01T00:00:00Z' };
      db.requests.push(r); save(); return wait(withReq(r));
    },
    async myRequests() { const u = need(); return wait(db.requests.filter(r => r.seeker_id === u.id).sort(byNew).map(withReq)); },
    async incomingRequests() {
      const u = need(); const mine = db.pets.filter(p => p.owner_id === u.id).map(p => p.id);
      return wait(db.requests.filter(r => mine.includes(r.pet_id)).sort((a, b) => a.created_at.localeCompare(b.created_at)).map(withReq));
    },
    async getRequest(id) {
      const u = need(); const r = db.requests.find(x => x.id == id);
      if (!r || (r.seeker_id !== u.id && pet(r.pet_id)?.owner_id !== u.id)) return wait(null);
      return wait(withReq(r));
    },
    async updateRequest(id, patch) {
      const r = db.requests.find(x => x.id == id); const u = need();
      const p = { ...patch };
      if (pet(r.pet_id)?.owner_id !== u.id && p.status && p.status !== 'Atšaukta') delete p.status;
      Object.assign(r, p); save(); return wait(withReq(r));
    },
    async markRead(req) {
      const r = db.requests.find(x => x.id == req.id); if (!r) return;
      r[r.seeker_id === db.session ? 'seeker_read_at' : 'owner_read_at'] = now(); save();
    },
    async listMessages(rid) { return wait(clone(db.messages.filter(m => m.request_id == rid))); },
    async sendMessage(rid, body, kind = 'text') {
      const u = active(); const m = { id: nid(), request_id: Number(rid), sender_id: u.id, body, kind, created_at: now() };
      db.messages.push(m); save(); return wait(clone(m));
    },
    async lastMessages(ids) { const out = {}; db.messages.filter(m => ids.includes(m.request_id)).forEach(m => { out[m.request_id] = clone(m); }); return wait(out); },

    async createReport(id, reason, details) {
      const u = active(); db.reports.push({ id: nid(), pet_id: Number(id), reporter_id: u.id, reason, details, status: 'Nauja', created_at: now() });
      save(); return wait();
    },
    async listReports() { if (!isAdmin()) return wait([]); return wait(db.reports.slice().sort(byNew).map(r => ({ ...clone(r), pet: withOwner(pet(r.pet_id)) }))); },
    async resolveReport(report, status) {
      if (status === 'Pašalinta') { const p = pet(report.pet_id); if (p) p.hidden = true; }
      db.reports.forEach(r => { if (r.id === report.id || (r.pet_id === report.pet_id && r.status === 'Nauja')) r.status = status; });
      save(); return wait();
    },

    async myApplication() { const u = need(); return wait(clone(db.applications.filter(a => a.user_id === u.id).sort(byNew)[0] || null)); },
    async submitApplication(d, files) {
      const u = active(); const docs = [];
      for (const f of files) docs.push(f.name + '|' + (f.size < 400000 ? await readFile(f) : ''));
      const a = { ...d, id: nid(), user_id: u.id, docs, status: 'Laukia', admin_note: '', created_at: now() };
      db.applications.push(a); save(); return wait(clone(a));
    },
    async listApplications() { if (!isAdmin()) return wait([]); return wait(db.applications.slice().sort(byNew).map(a => ({ ...clone(a), user: pub(db.users.find(u => u.id === a.user_id)) }))); },
    async docUrl(path) { return path.split('|')[1] || ''; },
    async decideApplication(id, approve, note) {
      if (!isAdmin()) throw new Error('Tik administratorius');
      const a = db.applications.find(x => x.id === id); a.status = approve ? 'Patvirtinta' : 'Atmesta'; a.admin_note = note || '';
      if (approve) {
        const u = db.users.find(x => x.id === a.user_id);
        Object.assign(u, { role: u.role === 'admin' ? 'admin' : 'shelter', verified: true, shelter_name: a.org_name, city: a.city || u.city, phone: a.phone, website: a.website, address: a.address, about: a.about });
      }
      save(); return wait();
    },

    async adminUsers() {
      if (!isAdmin()) throw new Error('Tik administratorius');
      return wait(db.users.slice().sort(byNew).map(u => ({ ...pub(u), onboarded: !!u.onboarded, email: u.email, created_at: u.created_at, last_sign_in_at: null, pet_count: db.pets.filter(p => p.owner_id === u.id).length })));
    },
    async adminSetUser(id, patch) { if (!isAdmin()) throw new Error('Tik administratorius'); Object.assign(db.users.find(u => u.id === id), patch); save(); return wait(); },
    async adminDeleteUser(id) {
      if (!isAdmin()) throw new Error('Tik administratorius');
      db.pets.filter(p => p.owner_id === id).forEach(p => cleanupPet(p.id));
      db.pets = db.pets.filter(p => p.owner_id !== id); db.requests = db.requests.filter(r => r.seeker_id !== id);
      db.users = db.users.filter(u => u.id !== id); save(); return wait();
    },
    async adminAllPets() { if (!isAdmin()) return wait([]); return wait(db.pets.slice().sort(byNew).map(withOwner)); },
    async adminHideUserPets(id, hidden) { db.pets.forEach(p => { if (p.owner_id === id) p.hidden = hidden; }); save(); return wait(); },
  };
  return api;
}
