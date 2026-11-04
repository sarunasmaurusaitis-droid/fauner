// Paskyra: prisijungimas, registracija (18+), Google/Facebook, slaptažodžio atkūrimas, profilis, prieglaudos paraiška
import { api, DEMO } from '../api.js?v=10';
import { esc, $, $$, icon, go, toast, confirmDialog, requireLogin, initial, isAdmin } from '../app.js?v=10';
import { CITIES } from '../data.js?v=10';
import { combo } from '../ui.js?v=10';

const ROLE_NAME = { user: 'Vartotojas', shelter: 'Prieglauda', admin: 'Administratorius' };
const HERO = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&q=80';
const maxBirth = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10); };
const isAdult = b => b && b <= maxBirth();

export function afterLogin() {
  const u = api.user;
  if (u && !u.onboarded) { go('uzbaigti-registracija'); return; }
  const back = sessionStorage.getItem('fauner-after-login');
  sessionStorage.removeItem('fauner-after-login');
  go(back ?? (u.role === 'shelter' ? 'skelbimai' : u.role === 'admin' ? 'admin' : ''));
}

const errText = m => ({
  'Invalid login credentials': 'Neteisingas el. paštas arba slaptažodis',
  'Email not confirmed': 'El. paštas dar nepatvirtintas – paspausk nuorodą laiške',
  'User already registered': 'Toks vartotojas jau užregistruotas',
}[m] || (/18 metų|pilnameč/.test(m) ? 'Fauner gali naudotis tik pilnamečiai (nuo 18 metų)' : m));

const socialButtons = () => `
  <div class="social">
    <button type="button" class="btn ghost block" data-oauth="google"><svg class="ic" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4"/></svg> Tęsti su Google</button>
    <button type="button" class="btn ghost block" data-oauth="facebook"><svg class="ic" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12"/></svg> Tęsti su Facebook</button>
  </div>
  <div class="or"><span>arba</span></div>`;

function bindSocial(root) {
  $$('[data-oauth]', root).forEach(b => b.onclick = async () => {
    try { await api.signInWith(b.dataset.oauth); } catch (e) { toast(e.message, 'err'); }
  });
}

const demoHint = () => DEMO ? `<div class="notice small">Demonstracinis režimas: prisijunk su <b>gabija@demo.lt</b>, <b>letenele@demo.lt</b> (prieglauda), <b>ona@demo.lt</b> arba <b>admin@demo.lt</b>. Slaptažodis – bet koks.</div>` : '';

const authShell = inner => `<div class="auth"><div class="auth-hero"><img src="${HERO}" alt=""></div><div class="auth-card">${inner}</div></div>`;

export async function renderLogin(box) {
  if (api.user) { afterLogin(); return; }
  box.innerHTML = authShell(`
    <form class="form" id="f">
      <h1>Prisijunk</h1>
      <p class="sub">Tavo išsaugoti gyvūnai ir žinutės laukia.</p>
      ${demoHint()}${socialButtons()}
      <label>El. paštas<input class="input" type="email" name="email" required autocomplete="email"></label>
      <label>Slaptažodis<span class="pw"><input class="input" type="password" name="password" required autocomplete="current-password"><button type="button" class="pw-eye" aria-label="Rodyti slaptažodį">${icon('eye', 'sm')}</button></span></label>
      <a class="link small right" href="#/slaptazodis">Pamiršai slaptažodį?</a>
      <button class="btn primary block" type="submit">Prisijungti</button>
      <p class="center sub">Neturi paskyros? <a class="link" href="#/registracija">Registruokis</a></p>
    </form>`);
  bindSocial(box); bindEyes(box);
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target), btn = e.submitter; btn.disabled = true;
    try { await api.signIn(f.get('email'), f.get('password')); toast('Prisijungta'); afterLogin(); }
    catch (err) { btn.disabled = false; toast(errText(err.message), 'err'); }
  };
}

function bindEyes(root) {
  $$('.pw-eye', root).forEach(b => b.onclick = () => { const i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; });
}

export async function renderRegister(box) {
  if (api.user) { afterLogin(); return; }
  box.innerHTML = authShell(`
    <form class="form" id="f" novalidate>
      <h1>Sukurk paskyrą</h1>
      <p class="sub">Rask augintinį arba naujus namus savo gyvūnui. Visi gyvūnai Fauner atiduodami <b>nemokamai</b>.</p>
      ${socialButtons()}
      <label>Vardas<input class="input" name="name" required maxlength="40" autocomplete="given-name"></label>
      <label>El. paštas<input class="input" type="email" name="email" required autocomplete="email"></label>
      <label>Slaptažodis<span class="pw"><input class="input" type="password" name="password" required minlength="8" autocomplete="new-password" placeholder="Bent 8 simboliai"><button type="button" class="pw-eye" aria-label="Rodyti slaptažodį">${icon('eye', 'sm')}</button></span></label>
      <label>Pakartok slaptažodį<input class="input" type="password" name="password2" required autocomplete="new-password"></label>
      <label>Gimimo data<input class="input" type="date" name="birth_date" required max="${maxBirth()}"><span class="hint">Fauner gali naudotis tik pilnamečiai. Gimimo data niekam nerodoma.</span></label>
      <label>Miestas ar rajonas</label><div id="city"></div>
      <label class="check"><input type="checkbox" name="rules" required> Sutinku su <a class="link" href="#/taisykles" target="_blank">Fauner taisyklėmis</a> ir <a class="link" href="#/privatumas" target="_blank">privatumo politika</a></label>
      <button class="btn primary block" type="submit">Sukurti paskyrą</button>
      <p class="center sub">Jau turi paskyrą? <a class="link" href="#/prisijungti">Prisijunk</a></p>
    </form>`);
  bindSocial(box); bindEyes(box);
  const city = combo($('#city', box), { options: CITIES, placeholder: 'Pasirink (nebūtina)' });
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const err = !f.name.trim() ? 'Įrašyk vardą' : !/^\S+@\S+\.\S+$/.test(f.email) ? 'Neteisingas el. pašto adresas'
      : f.password.length < 8 ? 'Slaptažodis turi būti bent 8 simbolių' : f.password !== f.password2 ? 'Slaptažodžiai nesutampa'
      : !f.birth_date ? 'Nurodyk gimimo datą' : !isAdult(f.birth_date) ? 'Fauner gali naudotis tik pilnamečiai (nuo 18 metų)'
      : !f.rules ? 'Reikia sutikti su taisyklėmis' : '';
    if (err) { toast(err, 'err'); return; }
    const btn = e.submitter; btn.disabled = true;
    try {
      const res = await api.signUp({ email: f.email.trim(), password: f.password, name: f.name.trim(), city: city.value, birth_date: f.birth_date });
      if (res.needsConfirm) {
        $('.auth-card', box).innerHTML = `<div class="center-col"><div class="big-check">${icon('check')}</div><h1>Patikrink el. paštą</h1>
          <p class="sub">Išsiuntėme patvirtinimo nuorodą į <b>${esc(f.email)}</b>. Paspaudęs ją būsi prijungtas.</p><a class="btn primary block" href="#/prisijungti">Prisijungti</a></div>`;
      } else { toast('Paskyra sukurta! Sveiki atvykę į Fauner'); afterLogin(); }
    } catch (er) { btn.disabled = false; toast(errText(er.message), 'err'); }
  };
}

// Prisijungus per Google / Facebook – reikia gimimo datos (18+)
export async function renderComplete(box) {
  if (!requireLogin()) return;
  const u = api.user;
  if (u.onboarded) { go(''); return; }
  box.innerHTML = `
    <div class="narrow">
      <h1>Užbaik registraciją</h1>
      <p class="sub">Liko vienas žingsnis. Fauner gali naudotis tik pilnamečiai, todėl reikia tavo gimimo datos – ji niekam nerodoma.</p>
      <form class="form panel" id="f" novalidate>
        <label>Vardas<input class="input" name="name" required maxlength="40" value="${esc(u.name)}"></label>
        <label>Gimimo data<input class="input" type="date" name="birth_date" required max="${maxBirth()}"></label>
        <label>Miestas ar rajonas</label><div id="city"></div>
        <label class="check"><input type="checkbox" name="rules"> Sutinku su <a class="link" href="#/taisykles" target="_blank">taisyklėmis</a> ir <a class="link" href="#/privatumas" target="_blank">privatumo politika</a></label>
        <button class="btn primary block" type="submit">Tęsti</button>
      </form>
      <button class="btn ghost block" id="out">${icon('out')} Atsijungti</button>
    </div>`;
  const city = combo($('#city', box), { options: CITIES, value: CITIES.includes(u.city) ? u.city : '', placeholder: 'Pasirink (nebūtina)' });
  $('#out', box).onclick = async () => { await api.signOut(); go(''); };
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const err = !f.name.trim() ? 'Įrašyk vardą' : !f.birth_date ? 'Nurodyk gimimo datą' : !isAdult(f.birth_date) ? 'Fauner gali naudotis tik pilnamečiai (nuo 18 metų)' : !f.rules ? 'Reikia sutikti su taisyklėmis' : '';
    if (err) { toast(err, 'err'); return; }
    try { await api.completeProfile({ birth_date: f.birth_date, city: city.value, name: f.name.trim() }); toast('Ačiū! Registracija baigta'); afterLogin(); }
    catch (er) { toast(errText(er.message), 'err'); }
  };
}

export async function renderForgot(box) {
  box.innerHTML = `
    <div class="narrow">
      <a class="back" href="#/prisijungti">${icon('back')} Prisijungimas</a>
      <h1>Pamiršai slaptažodį?</h1>
      <p class="sub">Įvesk el. paštą – atsiųsime nuorodą naujam slaptažodžiui sukurti.</p>
      <form class="form" id="f"><label>El. paštas<input class="input" type="email" name="email" required autocomplete="email"></label>
      <button class="btn primary block" type="submit">Siųsti nuorodą</button></form>
    </div>`;
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const email = new FormData(e.target).get('email').trim();
    try {
      await api.resetPassword(email);
      $('.narrow', box).innerHTML = `<div class="center-col"><div class="big-check">${icon('check')}</div><h1>Patikrink el. paštą</h1>
        <p class="sub">Jei paskyra su <b>${esc(email)}</b> egzistuoja, išsiuntėme nuorodą. Laiškas gali patekti į „Šlamštą“.</p><a class="btn ghost block" href="#/prisijungti">Grįžti</a></div>`;
    } catch (er) { toast(er.message, 'err'); }
  };
}

export async function renderNewPassword(box) {
  if (!api.user) { box.innerHTML = `<div class="empty"><h2>Nuoroda nebegalioja</h2><p>Paprašyk naujos nuorodos.</p><a class="btn primary" href="#/slaptazodis">Atkurti slaptažodį</a></div>`; return; }
  box.innerHTML = `
    <div class="narrow">
      <h1>Naujas slaptažodis</h1>
      <form class="form" id="f">
        <label>Naujas slaptažodis<input class="input" type="password" name="p1" required minlength="8" autocomplete="new-password" placeholder="Bent 8 simboliai"></label>
        <label>Pakartok<input class="input" type="password" name="p2" required autocomplete="new-password"></label>
        <button class="btn primary block" type="submit">Išsaugoti</button>
      </form>
    </div>`;
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (f.p1.length < 8) return toast('Slaptažodis turi būti bent 8 simbolių', 'err');
    if (f.p1 !== f.p2) return toast('Slaptažodžiai nesutampa', 'err');
    try { await api.updatePassword(f.p1); toast('Slaptažodis pakeistas'); afterLogin(); } catch (er) { toast(er.message, 'err'); }
  };
}

export async function renderProfile(box) {
  if (!requireLogin()) return;
  const u = api.user;
  const app = u.role === 'user' ? await api.myApplication().catch(() => null) : null;
  const name = u.shelter_name || u.name || 'Profilis';
  box.innerHTML = `
    <div class="narrow">
      <div class="profile-head">
        <label class="avatar-up" title="Keisti nuotrauką">
          ${u.avatar_url ? `<img class="avatar big" src="${esc(u.avatar_url)}" alt="">` : `<span class="avatar big">${esc(initial(name))}</span>`}
          <span class="avatar-cam">${icon('camera', 'xs')}</span><input type="file" accept="image/*" hidden id="avatar">
        </label>
        <div class="min0"><h1>${esc(name)}</h1><span class="sub">${esc(u.email || '')} · ${ROLE_NAME[u.role]}${u.role === 'shelter' ? (u.verified ? ' · patvirtinta' : '') : ''}</span></div>
      </div>
      ${u.banned ? '<div class="notice err">Tavo paskyra užblokuota administratoriaus. Gali peržiūrėti skelbimus, bet negali jų kelti ar rašyti žinučių.</div>' : ''}
      <div class="quick-links">
        <a class="panel ql" href="#/issaugoti">${icon('heart')} Išsaugoti</a>
        <a class="panel ql" href="#/zinutes">${icon('chat')} Žinutės</a>
        <a class="panel ql" href="#/skelbimai">${icon('grid')} ${u.role === 'shelter' ? 'Skydelis' : 'Mano skelbimai'}</a>
        ${isAdmin() ? `<a class="panel ql" href="#/admin">${icon('shield')} Administravimas</a>` : ''}
        ${u.role !== 'shelter' ? `<a class="panel ql" href="#/prieglauda/${esc(u.id)}">${icon('eye')} Mano viešas profilis</a>` : `<a class="panel ql" href="#/prieglauda/${esc(u.id)}">${icon('eye')} Prieglaudos puslapis</a>`}
      </div>
      ${u.role === 'user' ? `<div class="panel shelter-cta">
        ${!app ? `<b>Atstovauji gyvūnų prieglaudai?</b><p class="sub">Pateik paraišką – patvirtinta prieglauda gauna žymą „Patvirtinta prieglauda“ ir skydelį visiems gyvūnams valdyti.</p><a class="btn soft" href="#/prieglaudos-paraiska">Pateikti paraišką</a>`
          : app.status === 'Laukia' ? `<b>Prieglaudos paraiška pateikta</b><p class="sub">„${esc(app.org_name)}“ – laukia administratoriaus patvirtinimo. Paprastai tai užtrunka 1–3 darbo dienas.</p>`
          : app.status === 'Atmesta' ? `<b>Paraiška atmesta</b><p class="sub">${esc(app.admin_note || 'Susisiek su administracija dėl priežasčių.')}</p><a class="btn soft" href="#/prieglaudos-paraiska">Pateikti iš naujo</a>` : ''}
      </div>` : ''}
      <form class="form panel" id="f">
        <h2>Mano duomenys</h2>
        <label>Vardas<input class="input" name="name" required maxlength="40" value="${esc(u.name)}"></label>
        <label>Miestas ar rajonas</label><div id="city"></div>
        ${u.role === 'shelter' ? `
          <label>Prieglaudos pavadinimas<input class="input" name="shelter_name" required value="${esc(u.shelter_name || '')}"></label>
          <label>Adresas<input class="input" name="address" value="${esc(u.address || '')}"></label>
          <div class="two"><label>Telefonas<input class="input" name="phone" type="tel" value="${esc(u.phone || '')}"></label>
          <label>Svetainė / Facebook<input class="input" name="website" type="url" value="${esc(u.website || '')}"></label></div>
          <label>Apie prieglaudą<textarea class="input" name="about" rows="3" maxlength="1000">${esc(u.about || '')}</textarea></label>` : ''}
        <button class="btn primary block" type="submit">Išsaugoti</button>
      </form>
      <details class="panel">
        <summary><b>Paskyros nustatymai</b></summary>
        <form class="form" id="email-f"><label>Naujas el. paštas<input class="input" type="email" name="email" required placeholder="${esc(u.email || '')}"></label><button class="btn ghost block">Keisti el. paštą</button></form>
        <form class="form" id="pw-f"><label>Naujas slaptažodis<input class="input" type="password" name="p" minlength="8" required autocomplete="new-password" placeholder="Bent 8 simboliai"></label><button class="btn ghost block">Keisti slaptažodį</button></form>
        <button class="btn ghost block danger-text" id="del">${icon('trash')} Ištrinti paskyrą</button>
        <p class="sub small">Ištrynus paskyrą, visam laikui pašalinami tavo skelbimai, užklausos ir žinutės.</p>
      </details>
      <button class="btn ghost block" id="out">${icon('out')} Atsijungti</button>
    </div>`;
  const city = combo($('#city', box), { options: CITIES, value: CITIES.includes(u.city) ? u.city : '', placeholder: 'Pasirink' });
  $('#avatar', box).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { await api.uploadAvatar(f); toast('Nuotrauka atnaujinta'); renderProfile(box); } catch (er) { toast(er.message, 'err'); }
  };
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const patch = { name: f.name.trim(), city: city.value };
    if (u.role === 'shelter') Object.assign(patch, { shelter_name: f.shelter_name.trim(), address: f.address, phone: f.phone, website: f.website, about: f.about });
    try { await api.updateProfile(patch); toast('Profilis atnaujintas'); renderProfile(box); } catch (er) { toast(er.message, 'err'); }
  };
  $('#email-f', box).onsubmit = async e => {
    e.preventDefault();
    try { await api.updateEmail(new FormData(e.target).get('email').trim()); toast(DEMO ? 'El. paštas pakeistas' : 'Patvirtinimo laiškai išsiųsti į senąjį ir naująjį el. paštą'); e.target.reset(); }
    catch (er) { toast(er.message, 'err'); }
  };
  $('#pw-f', box).onsubmit = async e => {
    e.preventDefault();
    try { await api.updatePassword(new FormData(e.target).get('p')); toast('Slaptažodis pakeistas'); e.target.reset(); } catch (er) { toast(er.message, 'err'); }
  };
  $('#del', box).onclick = async () => {
    if (!await confirmDialog('Tikrai ištrinti paskyrą? Visi tavo skelbimai, užklausos ir žinutės bus ištrinti visam laikui.', 'Ištrinti paskyrą', true)) return;
    try { await api.deleteAccount(); toast('Paskyra ištrinta'); go(''); } catch (er) { toast(er.message, 'err'); }
  };
  $('#out', box).onclick = async () => {
    if (!await confirmDialog('Atsijungti?', 'Atsijungti')) return;
    await api.signOut(); toast('Atsijungta'); go('');
  };
}

// ---------- Prieglaudos paraiška ----------
export async function renderApplication(box) {
  if (!requireLogin('Prisijunk, kad galėtum pateikti paraišką')) return;
  const u = api.user;
  if (u.role !== 'user') { go('profilis'); return; }
  const prev = await api.myApplication().catch(() => null);
  if (prev?.status === 'Laukia') { box.innerHTML = `<div class="empty"><h2>Paraiška jau pateikta</h2><p>„${esc(prev.org_name)}“ laukia patvirtinimo.</p><a class="btn ghost" href="#/profilis">Į profilį</a></div>`; return; }
  box.innerHTML = `
    <div class="narrow">
      <a class="back" href="#/profilis">${icon('back')} Profilis</a>
      <h1>Prieglaudos paraiška</h1>
      <p class="sub">Patvirtintos prieglaudos gauna žymą „Patvirtinta prieglauda“ ir skydelį visiems gyvūnams valdyti. Paraišką peržiūri administratorius, paprastai per 1–3 darbo dienas.</p>
      <div class="notice small">Pagal VMVT reikalavimus gyvūnų globėjai turi būti įtraukti į <b>VMVT gyvūnų globėjų sąrašą</b> (globojant namuose) arba turėti <b>globos vietos veterinarinį patvirtinimą</b> (globos namams). Šiuos duomenis patikrinsime.</div>
      <form class="form" id="f" novalidate>
        <h2>Organizacija</h2>
        <label>Pavadinimas<input class="input" name="org_name" required maxlength="80" placeholder="Pvz. VšĮ „Letenėlė“"></label>
        <label>Teisinė forma</label>
        <div class="pills" data-group="legal_form"><button type="button" class="pill on" data-v="Juridinis asmuo">Juridinis asmuo (VšĮ, asociacija…)</button><button type="button" class="pill" data-v="Fizinis asmuo">Fizinis asmuo (globėjas)</button></div>
        <label class="jur">Juridinio asmens kodas<input class="input" name="company_code" inputmode="numeric" maxlength="9" placeholder="9 skaitmenys"></label>
        <label>VMVT sąrašo įrašas arba veterinarinio patvirtinimo Nr.<input class="input" name="vmvt_ref" required placeholder="Pvz. numeris iš VMVT pažymos"></label>
        <label>Globos vietos adresas<input class="input" name="address" required></label>
        <label>Miestas ar rajonas</label><div id="city"></div>
        <h2>Kontaktai</h2>
        <label>Atsakingas asmuo<input class="input" name="contact_person" required value="${esc(u.name)}"></label>
        <div class="two"><label>Telefonas<input class="input" type="tel" name="phone" required placeholder="+370 6xx xxxxx"></label>
        <label>El. paštas<input class="input" type="email" name="email" required value="${esc(u.email || '')}"></label></div>
        <label>Svetainė arba socialinio tinklo paskyra<input class="input" type="url" name="website" required placeholder="https://facebook.com/…"><span class="hint">VMVT reikalauja, kad globėjai viešai skelbtų informaciją apie globojamus gyvūnus.</span></label>
        <label>Trumpai apie veiklą<textarea class="input" name="about" rows="3" maxlength="1000" placeholder="Kokius gyvūnus globojate, nuo kada, kiek gyvūnų vidutiniškai…"></textarea></label>
        <h2>Dokumentai</h2>
        <p class="sub small">Pridėk Registrų centro išrašą (juridiniams asmenims) ir sutartį su veterinarijos paslaugų teikėju. PDF arba nuotraukos, iki 5 failų po 5 MB. Asmens dokumentų nesiųsk.</p>
        <label class="upload-row">${icon('file')} <span id="files-lbl">Pasirink failus</span><input type="file" id="files" multiple accept=".pdf,image/*" hidden></label>
        <label class="check"><input type="checkbox" name="truth"> Patvirtinu, kad pateikti duomenys teisingi, ir sutinku, kad administratorius juos patikrintų viešuose registruose.</label>
        <button class="btn primary block" type="submit">Pateikti paraišką</button>
      </form>
    </div>`;
  const city = combo($('#city', box), { options: CITIES, placeholder: 'Pasirink', required: true });
  let files = [];
  $$('[data-group] .pill', box).forEach(b => b.onclick = () => {
    $$('[data-group] .pill', box).forEach(x => x.classList.toggle('on', x === b));
    $('.jur', box).hidden = b.dataset.v !== 'Juridinis asmuo';
  });
  $('#files', box).onchange = e => {
    files = [...e.target.files].slice(0, 5);
    const big = files.find(f => f.size > 5e6);
    if (big) { toast(`Failas „${big.name}“ didesnis nei 5 MB`, 'err'); files = files.filter(f => f.size <= 5e6); }
    $('#files-lbl', box).textContent = files.length ? files.map(f => f.name).join(', ') : 'Pasirink failus';
  };
  $('#f', box).onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const legal = $('[data-group] .on', box).dataset.v;
    const err = !f.org_name.trim() ? 'Įrašyk pavadinimą' : legal === 'Juridinis asmuo' && !/^\d{9}$/.test(f.company_code.trim()) ? 'Juridinio asmens kodas turi būti 9 skaitmenų'
      : !f.vmvt_ref.trim() ? 'Nurodyk VMVT įrašą ar patvirtinimo numerį' : !f.address.trim() ? 'Nurodyk adresą' : !city.value ? 'Pasirink miestą'
      : !f.contact_person.trim() ? 'Nurodyk atsakingą asmenį' : !/^\+?[\d\s-]{8,}$/.test(f.phone) ? 'Neteisingas telefono numeris'
      : !/^\S+@\S+\.\S+$/.test(f.email) ? 'Neteisingas el. paštas' : !/^https?:\/\/\S+\.\S+/.test(f.website) ? 'Įrašyk svetainės ar paskyros nuorodą (su https://)'
      : !files.length ? 'Pridėk bent vieną dokumentą' : !f.truth ? 'Patvirtink, kad duomenys teisingi' : '';
    if (err) { toast(err, 'err'); return; }
    const btn = e.submitter; btn.disabled = true;
    try {
      await api.submitApplication({ org_name: f.org_name.trim(), legal_form: legal, company_code: legal === 'Juridinis asmuo' ? f.company_code.trim() : '',
        vmvt_ref: f.vmvt_ref.trim(), address: f.address.trim(), city: city.value, contact_person: f.contact_person.trim(), phone: f.phone.trim(),
        email: f.email.trim(), website: f.website.trim(), about: f.about.trim() }, files);
      toast('Paraiška pateikta! Informuosime, kai administratorius ją peržiūrės.');
      go('profilis');
    } catch (er) { btn.disabled = false; toast(er.message, 'err'); }
  };
}
