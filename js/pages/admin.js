// Administravimas: tikrinami skelbimai, pranešimai, prieglaudų paraiškos, vartotojai, visi skelbimai
import { api } from '../api.js?v=11';
import { esc, $, $$, icon, go, toast, photo, timeAgo, ownerName, confirmDialog, promptDialog, requireLogin, isAdmin, ageText, breedText, statusChip, initial, plural } from '../app.js?v=11';

const TABS = [['tikrinimas', 'Tikrinami skelbimai'], ['pranesimai', 'Pranešimai'], ['paraiskos', 'Prieglaudų paraiškos'], ['vartotojai', 'Vartotojai'], ['skelbimai', 'Visi skelbimai']];
const ROLE = { user: 'Vartotojas', shelter: 'Prieglauda', admin: 'Administratorius' };

export async function render(box, tab = 'tikrinimas') {
  if (!requireLogin()) return;
  if (!isAdmin()) { toast('Šis puslapis skirtas tik administratoriams'); go(''); return; }
  const [pets, reports, apps, users] = await Promise.all([api.adminAllPets(), api.listReports(), api.listApplications(), api.adminUsers()]);
  const pending = pets.filter(p => p.review_status === 'pending');
  const counts = { tikrinimas: pending.length, pranesimai: reports.filter(r => r.status === 'Nauja').length, paraiskos: apps.filter(a => a.status === 'Laukia').length };
  box.innerHTML = `
    <h1>Administravimas</h1>
    <div class="admin-tabs">${TABS.map(([k, l]) => `<a class="pill ${k === tab ? 'on' : ''}" href="#/admin/${k}">${l}${counts[k] ? ` <span class="cnt">${counts[k]}</span>` : ''}</a>`).join('')}</div>
    <div id="body"></div>`;
  const body = $('#body', box);
  const reload = () => render(box, tab);
  const userById = Object.fromEntries(users.map(u => [u.id, u]));

  const petLine = p => `
    <img src="${esc(photo(p))}" alt="">
    <div class="grow min0"><b>${esc(p.name)}, ${ageText(p.birth_date)}</b>
      <span class="sub block ellipsis">${esc(breedText(p))} · ${esc(p.city)} · ${p.owner_id ? esc(ownerName(p)) : '<span class="danger-text">be savininko</span>'}</span>
      <div class="row gap-s wrap">${statusChip(p.status)}${p.hidden ? '<span class="chip st-red">Paslėptas</span>' : ''}${p.archived ? '<span class="chip st-gray">Archyvuotas</span>' : ''}${p.review_status === 'pending' ? '<span class="chip st-new">Tikrinamas</span>' : p.review_status === 'rejected' ? '<span class="chip st-red">Atmestas</span>' : ''}</div>
    </div>`;

  // ----- Tikrinami skelbimai („ne pardavimui“) -----
  if (tab === 'tikrinimas') {
    const hl = (t, reason) => {
      let s = esc(t);
      (reason.replace('Rasti žodžiai: ', '').split(', ')).filter(Boolean).forEach(w => {
        s = s.replace(new RegExp(esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`);
      });
      return s;
    };
    body.innerHTML = `<p class="sub">Skelbimai, kuriuose rasta žodžių, susijusių su pardavimu ar pinigais. Kol nepatvirtinsi, jų niekas nemato.</p>` + (pending.length ? pending.map(p => `
      <div class="panel review" data-id="${p.id}">
        <div class="row gap">${petLine(p)}</div>
        <p class="chip st-new">${esc(p.review_reason)}</p>
        <p class="desc"><b>${hl(p.name, p.review_reason)}</b> – ${hl(p.description, p.review_reason)}</p>
        <div class="row gap wrap"><a class="btn ghost sm" href="#/gyvunas/${p.id}">Peržiūrėti</a>
          <button class="btn primary sm" data-ok>Patvirtinti</button><button class="btn danger sm" data-no>Atmesti</button></div>
      </div>`).join('') : '<div class="empty"><p>Tikrinamų skelbimų nėra.</p></div>');
    $$('.review', body).forEach(c => {
      const id = Number(c.dataset.id);
      $('[data-ok]', c).onclick = async () => { await api.updatePet(id, { review_status: 'ok', review_reason: '' }); toast('Skelbimas patvirtintas ir paskelbtas'); reload(); };
      $('[data-no]', c).onclick = async () => {
        const note = await promptDialog('Atmesti skelbimą? Parašyk priežastį – ją matys skelbimo autorius.', 'Pvz. Fauner gyvūnai atiduodami tik nemokamai', 'Atmesti');
        if (note === null) return;
        await api.updatePet(id, { review_status: 'rejected', review_reason: note || 'Skelbimas neatitinka taisyklių' }); toast('Skelbimas atmestas'); reload();
      };
    });
  }

  // ----- Pranešimai -----
  if (tab === 'pranesimai') {
    const chip = s => `<span class="chip ${s === 'Nauja' ? 'st-new' : s === 'Pašalinta' ? 'st-red' : 'st-gray'}">${esc(s)}</span>`;
    body.innerHTML = reports.length ? reports.map(r => `
      <div class="panel report-card" data-id="${r.id}">
        <div class="row gap">${r.pet ? petLine(r.pet) : '<div class="grow"><b>Ištrintas skelbimas</b></div>'}${chip(r.status)}</div>
        <p><b>${esc(r.reason)}</b> · ${timeAgo(r.created_at)} · iš viso ${plural(reports.filter(x => x.pet_id === r.pet_id).length, 'pranešimas', 'pranešimai', 'pranešimų')}</p>
        ${r.details ? `<p class="quote">„${esc(r.details)}“</p>` : ''}
        <div class="row gap wrap">${r.pet ? `<a class="btn ghost sm" href="#/gyvunas/${r.pet.id}">Peržiūrėti</a>` : ''}
          ${r.status === 'Nauja' ? `<button class="btn ghost sm" data-act="Atmesta">Atmesti pranešimą</button><button class="btn danger sm" data-act="Pašalinta">Paslėpti skelbimą</button>`
          : r.pet?.hidden ? `<button class="btn ghost sm" data-restore>Grąžinti skelbimą</button>` : ''}</div>
      </div>`).join('') : '<div class="empty"><p>Pranešimų nėra.</p></div>';
    $$('.report-card', body).forEach(c => {
      const r = reports.find(x => x.id === Number(c.dataset.id));
      $$('[data-act]', c).forEach(b => b.onclick = async () => {
        if (b.dataset.act === 'Pašalinta' && !await confirmDialog('Paslėpti skelbimą? Jo nebematys kiti vartotojai.', 'Paslėpti', true)) return;
        await api.resolveReport(r, b.dataset.act); toast('Atlikta'); reload();
      });
      const rs = $('[data-restore]', c); if (rs) rs.onclick = async () => { await api.updatePet(r.pet_id, { hidden: false }); toast('Skelbimas grąžintas'); reload(); };
    });
  }

  // ----- Prieglaudų paraiškos -----
  if (tab === 'paraiskos') {
    const row = (k, v) => v ? `<div><span class="sub">${k}</span><b>${esc(v)}</b></div>` : '';
    body.innerHTML = `<div class="notice small">Kaip tikrinti: 1) VMVT gyvūnų globėjų sąraše (vmvt.lrv.lt) ar globos vieta patvirtinta; 2) juridinio asmens kodą – Registrų centre (registrucentras.lt) arba rekvizitai.lt; 3) ar nurodyta svetainė / paskyra tikrai skelbia apie globojamus gyvūnus; 4) paskambink nurodytu telefonu.</div>` +
      (apps.length ? apps.map(a => `
      <div class="panel app" data-id="${a.id}">
        <div class="row between"><h3>${esc(a.org_name)}</h3><span class="chip ${a.status === 'Laukia' ? 'st-new' : a.status === 'Patvirtinta' ? 'st-wait' : 'st-red'}">${esc(a.status)}</span></div>
        <p class="sub small">Pateikė ${esc(a.user?.name || '')} (${esc(userById[a.user_id]?.email || '')}) · ${timeAgo(a.created_at)}</p>
        <div class="kv">
          ${row('Teisinė forma', a.legal_form)}${row('Juridinio asmens kodas', a.company_code)}${row('VMVT įrašas / patvirtinimas', a.vmvt_ref)}
          ${row('Adresas', [a.address, a.city].filter(Boolean).join(', '))}${row('Atsakingas asmuo', a.contact_person)}${row('Telefonas', a.phone)}${row('El. paštas', a.email)}
        </div>
        ${a.website ? `<p><a class="link" href="${esc(a.website)}" target="_blank" rel="noopener">${icon('globe', 'sm')} ${esc(a.website)}</a></p>` : ''}
        ${a.about ? `<p class="desc">${esc(a.about)}</p>` : ''}
        <div class="row gap wrap docs">${(a.docs || []).map((d, i) => `<button class="btn ghost sm" data-doc="${i}">${icon('file', 'sm')} ${esc(d.includes('|') ? d.split('|')[0] : d.split('/').pop().replace(/^\d+-/, ''))}</button>`).join('') || '<span class="sub small">Dokumentų nėra</span>'}</div>
        ${a.status === 'Laukia' ? `<div class="row gap"><button class="btn primary grow" data-ok>Patvirtinti</button><button class="btn ghost grow danger-text" data-no>Atmesti</button></div>` : a.admin_note ? `<p class="sub small">Pastaba: ${esc(a.admin_note)}</p>` : ''}
      </div>`).join('') : '<div class="empty"><p>Paraiškų nėra.</p></div>');
    $$('.app', body).forEach(c => {
      const a = apps.find(x => x.id === Number(c.dataset.id));
      $$('[data-doc]', c).forEach(b => b.onclick = async () => {
        const url = await api.docUrl(a.docs[Number(b.dataset.doc)]);
        if (url) window.open(url, '_blank', 'noopener'); else toast('Dokumento peržiūra demonstraciniame režime negalima');
      });
      const ok = $('[data-ok]', c), no = $('[data-no]', c);
      if (ok) ok.onclick = async () => {
        if (!await confirmDialog(`Patvirtinti „${a.org_name}“ kaip prieglaudą?`, 'Patvirtinti')) return;
        await api.decideApplication(a.id, true, ''); toast('Prieglauda patvirtinta'); reload();
      };
      if (no) no.onclick = async () => {
        const note = await promptDialog('Atmesti paraišką? Parašyk priežastį – ją matys pareiškėjas.', 'Pvz. nerastas VMVT sąraše', 'Atmesti');
        if (note === null) return;
        await api.decideApplication(a.id, false, note); toast('Paraiška atmesta'); reload();
      };
    });
  }

  // ----- Vartotojai -----
  if (tab === 'vartotojai') {
    body.innerHTML = `<div class="row gap wrap admin-tools"><label class="search-input grow">${icon('search')}<input id="uq" placeholder="Vardas, el. paštas ar miestas"></label>
      <select id="uf" class="input auto"><option value="">Visi</option><option value="user">Vartotojai</option><option value="shelter">Prieglaudos</option><option value="admin">Administratoriai</option><option value="banned">Užblokuoti</option></select></div>
      <p class="sub small">Naujas paskyras kurk per Supabase → Authentication → Add user, o rolę priskirk čia.</p>
      <div id="ulist" class="list"></div>`;
    const draw = () => {
      const q = $('#uq', body).value.trim().toLowerCase(), f = $('#uf', body).value;
      const list = users.filter(u => (!q || [u.name, u.email, u.city, u.shelter_name].join(' ').toLowerCase().includes(q)) && (!f || (f === 'banned' ? u.banned : u.role === f)));
      $('#ulist', body).innerHTML = list.map(u => `
        <div class="panel user-row" data-id="${esc(u.id)}">
          <div class="row gap"><span class="avatar soft">${esc(initial(u.shelter_name || u.name))}</span>
            <div class="grow min0"><b>${esc(u.shelter_name || u.name || '(be vardo)')}</b>${u.banned ? ' <span class="chip st-red">Užblokuotas</span>' : ''}${!u.onboarded ? ' <span class="chip st-gray">Neužbaigta registracija</span>' : ''}
              <span class="sub block ellipsis">${esc(u.email || '')} · ${esc(u.city || '—')} · ${plural(Number(u.pet_count || 0), 'skelbimas', 'skelbimai', 'skelbimų')} · nuo ${new Date(u.created_at).toLocaleDateString('lt-LT')}</span></div></div>
          <div class="row gap wrap">
            <select class="input auto" data-role ${u.id === api.user.id ? 'disabled' : ''}>${Object.entries(ROLE).map(([k, v]) => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
            <a class="btn ghost sm" href="#/vartotojas/${esc(u.id)}">Profilis</a>
            ${u.id === api.user.id ? '' : `<button class="btn ghost sm" data-ban>${icon('ban', 'sm')} ${u.banned ? 'Atblokuoti' : 'Blokuoti'}</button>
            <button class="btn ghost sm danger-text" data-del>${icon('trash', 'sm')} Ištrinti</button>`}
          </div>
        </div>`).join('') || '<p class="sub">Nieko nerasta.</p>';
      $$('.user-row', body).forEach(c => {
        const u = users.find(x => x.id === c.dataset.id);
        $('[data-role]', c).onchange = async e => {
          const role = e.target.value;
          if (!await confirmDialog(`Pakeisti ${u.name || u.email} rolę į „${ROLE[role]}“?`, 'Keisti')) { e.target.value = u.role; return; }
          let shelter_name = u.shelter_name;
          if (role === 'shelter' && !shelter_name) { shelter_name = await promptDialog('Prieglaudos pavadinimas', 'Pvz. VšĮ „Letenėlė“', 'Išsaugoti'); if (!shelter_name) { e.target.value = u.role; return; } }
          await api.adminSetUser(u.id, { role, verified: role === 'shelter', shelter_name: role === 'shelter' ? shelter_name.trim() : u.shelter_name });
          Object.assign(u, { role, verified: role === 'shelter', shelter_name }); toast('Rolė pakeista'); draw();
        };
        const ban = $('[data-ban]', c);
        if (ban) ban.onclick = async () => {
          const v = !u.banned;
          if (!await confirmDialog(v ? `Užblokuoti ${u.name || u.email}? Jo skelbimai bus paslėpti, jis negalės rašyti žinučių ir kelti skelbimų.` : `Atblokuoti ${u.name || u.email}? Jo skelbimai vėl bus matomi.`, v ? 'Blokuoti' : 'Atblokuoti', v)) return;
          await api.adminSetUser(u.id, { banned: v }); await api.adminHideUserPets(u.id, v);
          u.banned = v; toast(v ? 'Vartotojas užblokuotas' : 'Vartotojas atblokuotas'); draw();
        };
        const del = $('[data-del]', c);
        if (del) del.onclick = async () => {
          if (!await confirmDialog(`Ištrinti ${u.name || u.email} paskyrą visam laikui? Bus ištrinti visi jo skelbimai, užklausos ir žinutės.`, 'Ištrinti', true)) return;
          await api.adminDeleteUser(u.id); users.splice(users.indexOf(u), 1); toast('Paskyra ištrinta'); draw();
        };
      });
    };
    $('#uq', body).oninput = draw; $('#uf', body).onchange = draw;
    draw();
  }

  // ----- Visi skelbimai -----
  if (tab === 'skelbimai') {
    const owners = users.filter(u => !u.banned);
    body.innerHTML = `<div class="row gap wrap admin-tools"><label class="search-input grow">${icon('search')}<input id="pq" placeholder="Vardas, veislė, miestas ar savininkas"></label>
      <select id="pf" class="input auto"><option value="">Visi</option><option value="noowner">Be savininko</option><option value="hidden">Paslėpti</option><option value="pending">Tikrinami / atmesti</option></select></div>
      <div id="plist"></div>`;
    const draw = () => {
      const q = $('#pq', body).value.trim().toLowerCase(), f = $('#pf', body).value;
      const list = pets.filter(p => (!q || [p.name, p.breed, p.city, ownerName(p)].join(' ').toLowerCase().includes(q))
        && (!f || (f === 'noowner' ? !p.owner_id : f === 'hidden' ? p.hidden : p.review_status !== 'ok')));
      $('#plist', body).innerHTML = list.map(p => `
        <div class="panel pet-admin" data-id="${p.id}">
          <div class="row gap">${petLine(p)}</div>
          <div class="row gap wrap">
            <select class="input auto" data-owner><option value="">— priskirti savininką —</option>${owners.map(o => `<option value="${esc(o.id)}" ${o.id === p.owner_id ? 'selected' : ''}>${esc(o.shelter_name || o.name || o.email)}${o.role === 'shelter' ? ' (prieglauda)' : ''}</option>`).join('')}</select>
            <a class="btn ghost sm" href="#/skelbimai/${p.id}/redaguoti">${icon('edit', 'sm')} Redaguoti</a>
            <button class="btn ghost sm" data-hide>${p.hidden ? 'Rodyti' : 'Paslėpti'}</button>
            <button class="btn ghost sm danger-text" data-del>${icon('trash', 'sm')} Ištrinti</button>
          </div>
        </div>`).join('') || '<p class="sub">Nieko nerasta.</p>';
      $$('.pet-admin', body).forEach(c => {
        const p = pets.find(x => x.id === Number(c.dataset.id));
        $('[data-owner]', c).onchange = async e => {
          if (!e.target.value) return;
          await api.updatePet(p.id, { owner_id: e.target.value }); p.owner_id = e.target.value; p.owner = owners.find(o => o.id === e.target.value);
          toast('Savininkas priskirtas – skelbimas matomas paieškoje'); draw();
        };
        $('[data-hide]', c).onclick = async () => { await api.updatePet(p.id, { hidden: !p.hidden }); p.hidden = !p.hidden; toast(p.hidden ? 'Paslėpta' : 'Rodoma'); draw(); };
        $('[data-del]', c).onclick = async () => {
          if (!await confirmDialog(`Ištrinti „${p.name}“ visam laikui?`, 'Ištrinti', true)) return;
          await api.deletePet(p.id); pets.splice(pets.indexOf(p), 1); toast('Ištrinta'); draw();
        };
      });
    };
    $('#pq', body).oninput = draw; $('#pf', body).onchange = draw;
    draw();
  }
}
